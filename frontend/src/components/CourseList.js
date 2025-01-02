// CourseList.js
import React from "react";

const CourseList = ({ courses, onSelect }) => (
    <div>
        <h2>Courses</h2>
        <ul style={{ listStyleType: "none", padding: 0 }}>
            {courses.map((course) => (
                <li
                    key={course.courseid}
                    style={{
                        border: "1px solid #ccc",
                        padding: "10px",
                        marginBottom: "10px",
                        borderRadius: "5px",
                        cursor: "pointer",
                    }}
                    onClick={() => onSelect(course.courseid)}
                >
                    <strong>Course Name:</strong> {course.coursename} <br />
                    <strong>Course ID:</strong> {course.courseid}
                </li>
            ))}
        </ul>
    </div>
);

export default CourseList;