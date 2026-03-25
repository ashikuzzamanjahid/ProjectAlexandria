const SECTION_TYPES = ["slides", "notes", "videos", "resources", "additional"];

const normalizeSection = (value) => {
    const section = String(value || "resources").toLowerCase().trim();
    return SECTION_TYPES.includes(section) ? section : null;
};

const validateHttpUrl = (url) => {
    try {
        const parsed = new URL(String(url).trim());
        if (!parsed || !["http:", "https:"].includes(parsed.protocol)) return null;
        return parsed.toString();
    } catch {
        return null;
    }
};

const parsePagination = (query, defaults = { page: 1, limit: 20, maxLimit: 100 }) => {
    const rawPage = Number.parseInt(query.page, 10);
    const rawLimit = Number.parseInt(query.limit, 10);
    const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : defaults.page;
    const requestedLimit = Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : defaults.limit;
    const limit = Math.min(requestedLimit, defaults.maxLimit);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

module.exports = {
    SECTION_TYPES,
    normalizeSection,
    validateHttpUrl,
    parsePagination,
};
