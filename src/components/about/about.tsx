import React from 'react';
import './about.scss';

import Abinav from '../../assets/me/webp/Abinav.webp'; // Import your image
import tjklint2 from '../../assets/me/webp/tjklint2.webp';
import tjklint3 from '../../assets/me/webp/tjklint3.webp';
import tjklint4 from '../../assets/me/webp/tjklint4.webp';
import tjklint5 from '../../assets/me/webp/tjklint5.webp';
import tjklint6 from '../../assets/me/webp/tjklint6.webp';
import tjklint7 from '../../assets/me/webp/tjklint7.webp';
import tjklint8 from '../../assets/me/webp/tjklint8.webp';

const About: React.FC = () => {
  return (
    <div className="about-container" id="about">
      <section className="about-intro">
        <div className="about-text">
          <h2 className="about-title">About Me</h2>
          <p>
            Hello! My name is <span className="purple-text">Abinav Binukumar </span>
            I'm a passionate software engineering student with a love brainstorming new ideas!
          </p>
          <p>
            I'm currently studying at<span className="purple-text"> Ontario Tech University </span>
            in my <span className="purple-text">Third year</span> Woohoo!
          </p>
          <p>
            I have learned and worked on projects in a few different fields. I worked on <span className="purple-text"> Mobile App Dev</span> and <span className="purple-text"> Web Dev </span>
            projects mostly. During these projects, I have developed a strong interest in <span className="purple-text"> Product Engineering</span> and that is what I am focused on.
          </p>
          <p>
            And also to broaden my horizon, I have been learning and working on projects using <span className="purple-text">Bash scripting </span> and <span className="purple-text">Automation</span>.
          </p>
          <p>
            My skillset is quite wide-ranged. I like to choose
            the best tools to get the best product as fast as possible. I'm a quick learner, especially in fast-paced environments
            where I'm able to hone skills on the fly to improve and deliver on time.
          </p>
          <p>
            Outside of tech, you'll typically find me travelling, golfing, listening/discovering some live music, using the Oxford comma,
            and travelling!
          </p>
        </div>
        <div className="about-photo">
          <img src={Abinav} alt="Abinav" /> {/* Use Abinav.webp directly */}
        </div>
      </section>
    </div>
  );
}

export default About;
