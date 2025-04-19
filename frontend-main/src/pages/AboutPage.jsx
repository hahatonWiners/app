import React from 'react';
import './AboutPage.css';

const teamMembers = [
  {
    name: 'Носков Михаил',
    role: 'ML, Капитан команды',
    description: 'Описание 1',
    image: '/avatars/member1.jpg',
  },
  {
    name: 'Лошков Дмитрий',
    role: 'CV, Дизайнер',
    description: 'Описание 2',
    image: '/avatars/member3.jpg',
  },
  {
    name: 'Штуккерт Герман',
    role: 'Дизайнер',
    description: 'Описание 3',
    image: '/avatars/member2.jpg',
  },
  {
    name: 'Гладченко Богдан',
    role: 'Frontend',
    description: 'Описание 4',
    image: '/avatars/member4.jpg',
  },
  {
    name: 'Мухин Егор',
    role: 'Backend',
    description: 'Описание 5',
    image: '/avatars/member5.jpg',
  },
];

const AboutPage = () => {
  return (
    <div className="about-page">
      <h1>Наша команда</h1>
      
      {teamMembers.map((member, index) => (
        <div key={index} className="team-member">
          {index % 2 === 0 ? (
            <>
              <div className="member-image">
                <img src={member.image} alt={member.name} />
              </div>
              <div className="member-info">
                <h2>{member.name}</h2>
                <h3>{member.role}</h3>
                <p>{member.description}</p>
              </div>
            </>
          ) : (
            <>
              <div className="member-info">
                <h2>{member.name}</h2>
                <h3>{member.role}</h3>
                <p>{member.description}</p>
              </div>
              <div className="member-image">
                <img src={member.image} alt={member.name} />
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default AboutPage; 