import React, { useState, useEffect } from "react";
import { fetchCourses, fetchAllTopics, fetchAllResources, fetchCourseDetails, fetchResourcesByTopic } from './api';

const App = () => {
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
            setSelectedTopic(topic);
        } catch (error) {
            console.error("Error fetching resources for topic:", topic, error);
            setResources([]); // Fallback to no resources
        } finally {
            setLoadingResources(false);
        }

    
        
    };
    

    return (
        <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
            <h1 style={{ textAlign: "center" }}>Course Library</h1>

            {/* Search Box */}
            <input
                type="text"
                placeholder="Search courses, topics, resources"
                value={searchQuery}
                onChange={handleSearch}
                style={{ width: "100%", padding: "10px", fontSize: "16px", marginBottom: "20px", borderRadius: "5px", border: "1px solid #ccc" }}
            />

            <h2>Courses</h2>
            <ul style={{ listStyleType: "none", padding: 0 }}>
                {filteredCourses.map((course) => (
                    <li
                        key={course.courseid}
                        onClick={() => handleCourseSelect(course.courseid)}
                        style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px", borderRadius: "5px", cursor: "pointer" }}
                    >
                        <strong>Course Name:</strong> {course.coursename} <br />
                        <strong>Course ID:</strong> {course.courseid}
                    </li>
                ))}
            </ul>

            {/* Course Details */}
            {selectedCourse && (
    <div style={{ border: "1px solid #ccc", padding: "20px", marginTop: "20px", borderRadius: "5px" }}>
        <h2>Course Details</h2>
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
                        style={{ border: "1px solid #ddd", padding: "10px", marginBottom: "10px", borderRadius: "5px", cursor: "pointer" }}
                    >
                        {topic}
                        {selectedTopic === topic && (
                            <ul style={{ marginTop: "10px", paddingLeft: "20px" }}>
                                {loadingResources ? (
                                    <li>Loading resources...</li>
                                ) : resources.length > 0 ? (
                                    resources.map((link, index) => (
                                        <li key={index}>
                                            <a href={link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#007bff" }}>
                                                Link {index + 1}
                                            </a>
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
                <li>No topics available for this course.</li> // Handle case with no topics
            )}
        </ul>
    </div>
)}


            {loadingTopics && <p>Loading course details...</p>}
        </div>
    );
};

export default App;


