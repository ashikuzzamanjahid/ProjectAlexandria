const API_URL = import.meta.env.VITE_API_URL;

export const fetchCourses = async () => {
    const response = await fetch(`${API_URL}/api/topics`);
    if (!response.ok) throw new Error("Error fetching courses");
    return response.json();
};

export const fetchAllTopics = async () => {
    const response = await fetch(`${API_URL}/api/alltopics`);
    if (!response.ok) throw new Error("Error fetching topics");
    return response.json();
};

export const fetchAllResources = async () => {
    const response = await fetch(`${API_URL}/api/allresources`);
    if (!response.ok) throw new Error("Error fetching resources");
    return response.json();
};

export const fetchCourseDetails = async (courseid) => {
    const response = await fetch(`${API_URL}/api/topics/${courseid}`);
    if (!response.ok) throw new Error("Error fetching course details");
    return response.json();
};

export const fetchResourcesByTopic = async (courseid, topic) => {
    const response = await fetch(`${API_URL}/api/resources/${courseid}/${encodeURIComponent(topic)}`);
    if (!response.ok) throw new Error("Error fetching resources for the topic");
    const data = await response.json();
    return data.links || [];
};

export const submitResource = async (courseid, topic, url, token, section = "resources") => {
    const response = await fetch(
        `${API_URL}/api/resources/${courseid}/${encodeURIComponent(topic)}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ url, section }),
        }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to submit resource");
    return data;
};

export const likeResource = async (courseid, topic, url, section, token) => {
    const response = await fetch(`${API_URL}/api/resources/${courseid}/${encodeURIComponent(topic)}/like`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url, section }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to like resource");
    return data.likes;
};

export const dislikeResource = async (courseid, topic, url, section, token) => {
    const response = await fetch(`${API_URL}/api/resources/${courseid}/${encodeURIComponent(topic)}/dislike`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url, section }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to dislike resource");
    return data.dislikes;
};

export const updateResourceDescription = async (courseid, topic, url, section, description, token) => {
    const response = await fetch(`${API_URL}/api/resources/${courseid}/${encodeURIComponent(topic)}/description`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url, section, description }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to update description");
    return data.description;
};

export const reportResource = async (courseid, topic, payload, token) => {
    const response = await fetch(
        `${API_URL}/api/resources/${courseid}/${encodeURIComponent(topic)}/report`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to report resource");
    return data;
};

export const fetchAdminSubmissions = async (token, status = "pending", page = 1, limit = 20) => {
    const query = new URLSearchParams({
        status,
        page: String(page),
        limit: String(limit),
    });
    const response = await fetch(`${API_URL}/api/admin/submissions?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to fetch submissions");
    if (Array.isArray(data)) {
        return { items: data, total: data.length, page: 1, limit: data.length, hasNextPage: false };
    }
    return data;
};

export const approveSubmission = async (token, id, note = "") => {
    const response = await fetch(`${API_URL}/api/admin/submissions/${id}/approve`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ note }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to approve submission");
    return data;
};

export const rejectSubmission = async (token, id, note = "") => {
    const response = await fetch(`${API_URL}/api/admin/submissions/${id}/reject`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ note }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to reject submission");
    return data;
};

export const fetchAdminReports = async (token, status = "open", page = 1, limit = 20) => {
    const query = new URLSearchParams({
        status,
        page: String(page),
        limit: String(limit),
    });
    const response = await fetch(`${API_URL}/api/admin/reports?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to fetch reports");
    if (Array.isArray(data)) {
        return { items: data, total: data.length, page: 1, limit: data.length, hasNextPage: false };
    }
    return data;
};

export const resolveReport = async (token, id, dismiss = false) => {
    const response = await fetch(`${API_URL}/api/admin/reports/${id}/resolve`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ dismiss }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to resolve report");
    return data;
};

export const deleteAdminResource = async (token, payload) => {
    const response = await fetch(`${API_URL}/api/admin/resources/delete`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to delete resource");
    return data;
};
