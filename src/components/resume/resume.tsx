import React from 'react';
import './resume.scss';

const Resume: React.FC = () => {
  return (
    <div className="resume-container" id="resume">
      {/* <h1 className="resume-title">Resume</h1> */}
      <div className="content-wrapper">
        <div className="left-column">
          <div className="section-container">
            <h1 className="section-title">Education</h1>
            <div className="line-container">
              <div className="job-container">
                <h3 className="job-title">
                  Bachelor of Engineering (Honours), <br/>Software Engineering<br/> <span className="company">@Ontario Tech University</span>
                </h3>
                <p className="job-dates">Expected: May 2026</p>
                <p>CGPA: 4.00/4.3</p>
              </div>
              <div className="job-container">
                <h3 className="job-title">
                  Diploma in Graphics Design and Information Technology<br/><span className="company">@G-Tec Education</span>
                </h3>
                <p className="job-dates">March 2021</p>
              </div>
            </div>
          </div>

          <div className="section-container">
            <h1 className="section-title">Experience</h1>
            <div className="line-container">
              <div className="job-container">
                <h3 className="job-title">
                  Software Developer <br/><span className="company">@EmpowHer Initiatives Inc (Volunteer Internship)</span>
                </h3>
                <p className="job-dates">June 2024 - August 2024</p>
                <ul>
                  <li className="bullet-point">
                    Developed "Excelle," a mobile app to empower women and facilitate professional connections using React Native.
                  </li>
                  <li className="bullet-point">
                    Integrated backend services with MongoDB, Express, and Node.js to manage user data and ensure secure interactions.
                  </li>
                  <li className="bullet-point">
                    Collaborated with a cross-functional team to enhance app usability through user testing and feedback.
                  </li>
                </ul>
              </div>

              <div className="job-container">
                <h3 className="job-title">
                  Communication Assistant <br/><span className="company">@Ontario Tech University</span>
                </h3>
                <p className="job-dates">May 2024 - August 2024</p>
                <ul>
                  <li className="bullet-point">
                    Updated and maintained Engineering Faculty webpages using CMS Cascade and designed engaging content.
                  </li>
                  <li className="bullet-point">
                    Managed project workflows with Jira to track tasks and deadlines.
                  </li>
                  <li className="bullet-point">
                    Conducted focus groups for feedback on website content and implemented improvements.
                  </li>
                </ul>
              </div>

              <div className="job-container">
                <h3 className="job-title">
                  Security Guard <span className="company">@Allied Universal Security Services / Paragon Security</span>
                </h3>
                <p className="job-dates">June 2023 - Present / June 2023 - September 2023</p>
              </div>
            </div>
          </div>

          
        </div>
        
        <div className="right-column">
          <iframe
            title="Abinav Binukumar Resume"
            src="https://drive.google.com/file/d/1Frvo5XrWt98EiMNSHypjSaWBW2oHj5Jh/preview"
            allow="autoplay"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Resume;
