import React, { useState } from "react";

const CourseDetails = ({ course, fetchResources }) => {
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [resources, setResources] = useState([]); // Initialize to an empty array
    const [loadingResources, setLoadingResources] = useState(false);

    const handleTopicClick = (topic) => {
        setSelectedTopic(topic);
        setLoadingResources(true);

        // Fetch resources for the selected topic
        fetchResources(course.courseid, topic)
            .then((data) => {
                setResources(data?.links || []); // Safeguard: Ensure resources is an array
                setLoadingResources(false);
            })
            .catch((error) => {
                console.error("Error fetching resources:", error);
                setResources([]); // Reset resources on error
                setLoadingResources(false);
            });
    };

    return (
        <div>
            <h2>Course Details</h2>
            <p><strong>Course Name:</strong> {course.coursename}</p>
            <p><strong>Number of Topics:</strong> {course.numberOfTopics}</p>
            <ul>
                {course.topics.map((topic) => (
                    <li key={topic}>
                        <button onClick={() => handleTopicClick(topic)}>
                            {topic}
                        </button>
                        {/* Render resources for the selected topic */}
                        {selectedTopic === topic && (
                            <ul>
                                {loadingResources ? (
                                    <li>Loading resources...</li>
                                ) : resources.length > 0 ? (
                                    resources.map((link, index) => (
                                        <li key={index}>
                                            <a href={link} target="_blank" rel="noopener noreferrer">
                                                {link}
                                            </a>
                                        </li>
                                    ))
                                ) : (
                                    <li>No resources available.</li>
                                )}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CourseDetails;
