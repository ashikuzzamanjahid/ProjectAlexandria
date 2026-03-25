const createResourceExists = (Resource) => async ({ courseid, topic, section, url }) => {
    const exists = await Resource.exists({
        courseid,
        topic,
        section,
        links: url,
    });
    return !!exists;
};

module.exports = { createResourceExists };
