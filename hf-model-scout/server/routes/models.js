const express = require("express");
const axios = require("axios");
const NodeCache = require("node-cache");

const router = express.Router();
const cache = new NodeCache({ stdTTL: 300 });

const HF_BASE = "https://huggingface.co/api/models";
const AXIOS_TIMEOUT = 8000;

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
        task: req.query.task,
        sort: req.query.sort,
        library: req.query.library,
        search: req.query.search,
        limit: req.query.limit
      },
      timeout: AXIOS_TIMEOUT
    });

    const data = Array.isArray(response.data) ? response.data : [];
    if (data.length === 0) {
      return sendError(res, "NOT_FOUND", "No models found", 404);
    }

    cache.set(cacheKey, data);
    return res.json(data);
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
