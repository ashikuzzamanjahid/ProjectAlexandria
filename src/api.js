// api.js
export const fetchCourses = async () => {
    const response = await fetch("http://localhost:5000/api/topics");
    if (!response.ok) throw new Error("Error fetching courses");
    return response.json();
};

export const fetchAllTopics = async () => {
    const response = await fetch("http://localhost:5000/api/alltopics");
    if (!response.ok) throw new Error("Error fetching topics");
    return response.json();
};

export const fetchAllResources = async () => {
    const response = await fetch("http://localhost:5000/api/allresources");
    if (!response.ok) throw new Error("Error fetching resources");
    return response.json();
};

export const fetchCourseDetails = async (courseid) => {
    const response = await fetch(`http://localhost:5000/api/topics/${courseid}`);
    if (!response.ok) throw new Error("Error fetching course details");
    return response.json();
};

export const fetchResourcesByTopic = async (courseid, topic) => {
    const response = await fetch(`http://localhost:5000/api/resources/${courseid}/${encodeURIComponent(topic)}`);
    if (!response.ok) throw new Error("Error fetching resources for the topic");
    const data = await response.json();
    return data.links ? [{ links: data.links }] : [];
};

