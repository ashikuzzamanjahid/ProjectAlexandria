import React, { useState, useEffect } from "react";
import { fetchCourses, fetchAllTopics, fetchAllResources, fetchCourseDetails, fetchResourcesByTopic } from './api';

const ResourceBox = ({ link, courseid, topic }) => {
    const [likes, setLikes] = useState(0);
    const [dislikes, setDislikes] = useState(0);
    const [description, setDescription] = useState("");

    useEffect(() => {
        const fetchLinkInfo = async () => {
            try {
                const response = await fetch(`/api/resources/${courseid}/${topic}`);
                const data = await response.json();
    
                console.log("Fetched Data:", data);
    
                const linkInfo = data.links.find(l => l.url === link);
    
                console.log("Matched Link Info:", linkInfo);
    
                if (linkInfo) {
                    setLikes(linkInfo.likes || 0);
                    setDislikes(linkInfo.dislikes || 0);
                    setDescription(linkInfo.description || "");
                }
            } catch (error) {
                console.error("Failed to fetch link info:", error);
            }
        };
        fetchLinkInfo();
    }, [link, courseid, topic]);
    
    
    
    

    const handleLike = async () => {
        const response = await fetch(`/api/resources/${courseid}/${topic}/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: link })
        });
        const data = await response.json();
        setLikes(parseInt(data.likes));
    };

    const handleDislike = async () => {
        const response = await fetch(`/api/resources/${courseid}/${topic}/dislike`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: link })
        });
        const data = await response.json();
        setDislikes(parseInt(data.dislikes));
    };

    const handleDescriptionChange = async (e) => {
        const newDescription = e.target.value;
        setDescription(newDescription);
        await fetch(`/api/resources/${courseid}/${topic}/description`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: link, description: newDescription })
        });
    };

    return (
        <div className="resource-box" style={{ border: "1px solid #ccc", padding: "15px", marginBottom: "15px", borderRadius: "10px", backgroundColor: "#f9f9f9" }}>
            <a href={link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#007bff", fontSize: "16px" }}>{link}</a>
            <div style={{ marginTop: "10px" }}>
                <textarea
                    placeholder="description..."
                    value={description}
                    onChange={handleDescriptionChange}
                    style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc", marginBottom: "10px" }}
                />
                <button onClick={handleLike} style={{ marginRight: "10px", padding: "5px 10px", borderRadius: "5px", border: "none", backgroundColor: "#28a745", color: "#fff" }}>Like</button>
                <span style={{ marginRight: "20px" }}>{likes}</span>
                <button onClick={handleDislike} style={{ padding: "5px 10px", borderRadius: "5px", border: "none", backgroundColor: "#dc3545", color: "#fff" }}>Dislike</button>
                <span>{dislikes}</span>
            </div>
        </div>
    );
};

const Library = () => {
    const [courseIds, setCourseIds] = useState([]);
    const [topics, setTopics] = useState([]);
    const [resources, setResources] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [loadingTopics, setLoadingTopics] = useState(false);
    const [loadingResources, setLoadingResources] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [filteredTopics, setFilteredTopics] = useState([]);
    const [filteredResources, setFilteredResources] = useState([]);

    useEffect(() => {
        // Fetch all data on mount
        fetchCoursesData();
        fetchTopicsData();
        fetchResourcesData();
    }, []);

    const fetchCoursesData = async () => {
        try {
            const data = await fetchCourses();
            setCourseIds(data);
            setFilteredCourses(data);
        } catch (error) {
            console.error("Error fetching courses:", error);
        }
    };

    const fetchTopicsData = async () => {
        try {
            const data = await fetchAllTopics();
            setTopics(data);
            setFilteredTopics(data);
        } catch (error) {
            console.error("Error fetching topics:", error);
        }
    };

    const fetchResourcesData = async () => {
        try {
            const data = await fetchAllResources();
            setResources(data);
        } catch (error) {
            console.error("Error fetching resources:", error);
        }
    };

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        // Filter courses, topics, and resources based on the search query
        const filteredCourses = courseIds.filter(course => 
            course.coursename.toLowerCase().includes(query) || 
            course.courseid.toLowerCase().includes(query)
        );

        const filteredTopics = topics.filter(topic =>
            topic.toLowerCase().includes(query)
        );

        const filteredResources = resources.filter(resource =>
            resource.links.some(link => link.toLowerCase().includes(query))
        );

        // Update the filtered data states
        setFilteredCourses(filteredCourses);
        setFilteredTopics(filteredTopics);
        setFilteredResources(filteredResources);
    };

    const handleCourseSelect = async (courseid) => {
        setLoadingTopics(true);
        try {
            const data = await fetchCourseDetails(courseid);
            setSelectedCourse(data);
            setLoadingTopics(false);
            setSelectedTopic(null);
            setResources([]);
        } catch (error) {
            console.error("Error fetching course details:", error);
            setLoadingTopics(false);
        }
    };

    const handleTopicSelect = async (courseid, topic) => {
        setLoadingResources(true);
        try {
            const data = await fetchResourcesByTopic(courseid, topic);
            console.log("API Response for topic:", topic, data); // Log API response
            setResources(data || []); // Ensure empty array if no resources
            setFilteredResources(data.flatMap(resource => resource.links) || []); // Update filtered resources
            setSelectedTopic(topic);
        } catch (error) {
            console.error("Error fetching resources for topic:", topic, error);
            setResources([]); // Fallback to no resources
            setFilteredResources([]); // Fallback to no filtered resources
        } finally {
            setLoadingResources(false);
        }
    };

    return (
        <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
            <h1 style={{ textAlign: "center", color: "#333" }}>Course Library</h1>

            {/* Search Box */}
            <input
                type="text"
                placeholder="Search courses, topics, resources"
                value={searchQuery}
                onChange={handleSearch}
                style={{ width: "100%", padding: "10px", fontSize: "16px", marginBottom: "20px", borderRadius: "5px", border: "1px solid #ccc" }}
            />

            <h2 style={{ color: "#555" }}>Courses</h2>
            <ul style={{ listStyleType: "none", padding: 0 }}>
                {filteredCourses.map((course) => (
                    <li
                        key={course.courseid}
                        onClick={() => handleCourseSelect(course.courseid)}
                        style={{ border: "1px solid #ccc", padding: "15px", marginBottom: "10px", borderRadius: "10px", cursor: "pointer", backgroundColor: "#f9f9f9" }}
                    >
                        <strong>Course Name:</strong> {course.coursename} <br />
                        <strong>Course ID:</strong> {course.courseid}
                    </li>
                ))}
            </ul>

            {/* Course Details */}
            {selectedCourse && (
                <div style={{ border: "1px solid #ccc", padding: "20px", marginTop: "20px", borderRadius: "10px", backgroundColor: "#f9f9f9" }}>
                    <h2 style={{ color: "#555" }}>Course Details</h2>
                    <p><strong>Course ID:</strong> {selectedCourse.courseid}</p>
                    <p><strong>Course Name:</strong> {selectedCourse.coursename}</p>
                    <p><strong>Number of Topics:</strong> {selectedCourse.numberOfTopics}</p>

                    {/* Render Topics */}
                    <ul style={{ listStyleType: "none", padding: 0 }}>
                        {selectedCourse.topics.length > 0 ? (
                            selectedCourse.topics.map((topic) => (
                                <li
                                    key={topic}
                                    onClick={() => handleTopicSelect(selectedCourse.courseid, topic)}
                                    style={{ border: "1px solid #ddd", padding: "10px", marginBottom: "10px", borderRadius: "10px", cursor: "pointer", backgroundColor: "#fff" }}
                                >
                                    {topic}
                                    {selectedTopic === topic && (
                                        <ul style={{ marginTop: "10px", paddingLeft: "20px" }}>
                                            {loadingResources ? (
                                                <li>Loading resources...</li>
                                            ) : filteredResources.length > 0 ? (
                                                filteredResources.map((link, index) => (
                                                    <li key={index}>
                                                        <ResourceBox key={index} link={link.url} courseid={selectedCourse.courseid} topic={selectedTopic} />
                                                    </li>
                                                ))
                                            ) : (
                                                <li>No resources available.</li>
                                            )}
                                        </ul>
                                    )}
                                </li>
                            ))
                        ) : (
                            <li>No topics available for this course.</li>
                        )}
                    </ul>
                </div>
            )}

            {loadingTopics && <p>Loading course details...</p>}
        </div>
    );
};

export default Library;
