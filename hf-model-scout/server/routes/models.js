const express = require("express");
const axios = require("axios");
const NodeCache = require("node-cache");

const router = express.Router();
const cache = new NodeCache({ stdTTL: 300 });

const HF_BASE = "https://huggingface.co/api/models";
const AXIOS_TIMEOUT = 8000;

const normalizeModel = (model) => {
  const baseModel = model.cardData?.base_model;
  const baseModelValue = Array.isArray(baseModel) ? baseModel[0] ?? null : baseModel ?? null;

  return {
    id: model.id,
    author: model.author,
    name: model.id.split("/")[1] ?? model.id,
    task: model.pipeline_tag ?? model.cardData?.pipeline_tag ?? null,
    library: model.library_name ?? model.cardData?.library_name ?? null,
    downloads: model.downloads ?? 0,
    likes: model.likes ?? 0,
    lastModified: model.lastModified ?? null,
    createdAt: model.createdAt ?? model.cardData?.createdAt ?? null,
    trendingScore: model.trendingScore ?? 0,
    gated: model.gated ?? false,
    url: `https://huggingface.co/${model.id}`,
    license:
      model.cardData?.license ??
      model.tags?.find((tag) => tag.startsWith("license:"))?.replace("license:", "") ??
      "unknown",
    language: model.cardData?.language ?? model.tags?.filter((tag) => /^[a-z]{2}$/.test(tag)) ?? [],
    baseModel: baseModelValue,
    datasets: model.cardData?.datasets ?? [],
    architecture: model.config?.architectures?.[0] ?? null,
    modelType: model.config?.model_type ?? null,
    paramCount: model.safetensors?.total ?? null,
    specialTags:
      model.tags?.filter((tag) =>
        ["gguf", "quantized", "lora", "4-bit", "8-bit", "awq", "gptq"].includes(tag.toLowerCase())
      ) ?? []
  };
};

const sendError = (res, code, message, status) => {
  return res.status(status).json({ error: true, code, message });
};

const mapAxiosError = (error) => {
  if (error?.code === "ECONNABORTED") {
    return { code: "TIMEOUT", message: "HuggingFace request timed out" };
  }

  if (error?.response) {
    if (error.response.status >= 500) {
      return { code: "HF_DOWN", message: "HuggingFace API error" };
    }
    if (error.response.status === 404) {
      return { code: "NOT_FOUND", message: "Model not found" };
    }
  }

  return { code: "NETWORK_ERROR", message: "Unable to reach HuggingFace" };
};

router.get("/", async (req, res) => {
  const cacheKey = req.originalUrl;
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    const response = await axios.get(HF_BASE, {
      params: {
        pipeline_tag: req.query.task,
        sort: req.query.sort,
        direction: -1,
        limit: req.query.limit,
        search: req.query.search,
        ...(req.query.library && req.query.library !== "All" ? { library: req.query.library } : {}),
        "expand[]": [
          "downloads",
          "likes",
          "cardData",
          "config",
          "safetensors",
          "trendingScore",
          "library_name",
          "createdAt"
        ]
      },
      timeout: AXIOS_TIMEOUT
    });

    const data = Array.isArray(response.data) ? response.data : [];
    if (data.length === 0) {
      return sendError(res, "NOT_FOUND", "No models found", 404);
    }
    const normalized = data.map(normalizeModel);

    cache.set(cacheKey, normalized);
    return res.json(normalized);
  } catch (error) {
    const mapped = mapAxiosError(error);
    const status = mapped.code === "TIMEOUT" ? 504 : mapped.code === "HF_DOWN" ? 502 : 503;
    return sendError(res, mapped.code, mapped.message, status);
  }
});

router.get("/:modelId", async (req, res) => {
  try {
    const response = await axios.get(`${HF_BASE}/${req.params.modelId}`, {
      timeout: AXIOS_TIMEOUT
    });
    return res.json(response.data);
  } catch (error) {
    const mapped = mapAxiosError(error);
    const status = mapped.code === "NOT_FOUND" ? 404 : mapped.code === "TIMEOUT" ? 504 : mapped.code === "HF_DOWN" ? 502 : 503;
    return sendError(res, mapped.code, mapped.message, status);
  }
});

module.exports = router;
