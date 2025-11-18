import React from 'react';
import ClassroomCard from './ClassroomCard';

const ClassroomList = ({ classrooms }) => {
  return (
    <div className="classroom-list">
      {classrooms.length === 0 ? (
        <p>No classrooms available.</p>
      ) : (
        classrooms.map(classroom => (
          <ClassroomCard key={classroom.id} classroom={classroom} />
        ))
      )}
    </div>
  );
};

export default ClassroomList;