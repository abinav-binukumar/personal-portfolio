import React from 'react';
import { FaGithub, FaGitlab, FaDocker, FaJira, FaJava, FaPython, FaJs, FaReact } from 'react-icons/fa';
import { SiCsharp, SiCplusplus, SiMysql, SiPostgresql, SiMongodb, SiDotnet, SiVisualstudio, SiFigma, SiAdobe, SiCanva } from 'react-icons/si';
import { TbAssembly } from "react-icons/tb"; // NIOS Assembly icon
import { AiOutlineMoon } from "react-icons/ai"; // Icon for CMS
import './techstack.scss';

const Techstack: React.FC = () => {
  return (
    <div className="about-technologies-container">
      <section className="about-technologies">
        <h2>My Techstack</h2>
        <div className="technology-categories">
          
          <div className="technology-category">
            <h3>Languages</h3>
            <div className="technology-items">
              <div className="technology-item"><SiCsharp /><p>C#</p></div>
              <div className="technology-item"><FaJava /><p>Java</p></div>
              <div className="technology-item"><SiCplusplus /><p>C++</p></div>
              <div className="technology-item"><FaPython /><p>Python</p></div>
              <div className="technology-item"><FaJs /><p>JavaScript</p></div>
              <div className="technology-item"><SiMysql /><p>MySQL</p></div>
              <div className="technology-item"><SiPostgresql /><p>PostgreSQL</p></div>
              <div className="technology-item"><SiMongodb /><p>MongoDB</p></div>
              <div className="technology-item"><TbAssembly /><p>NIOS Assembly</p></div>
            </div>
          </div>

          <div className="technology-category">
            <h3>Developer Tools</h3>
            <div className="technology-items">
              <div className="technology-item"><FaGithub /><p>GitHub</p></div>
              <div className="technology-item"><FaGitlab /><p>GitLab</p></div>
              <div className="technology-item"><FaDocker /><p>Docker</p></div>
              <div className="technology-item"><FaJira /><p>Jira</p></div>
              <div className="technology-item"><SiVisualstudio /><p>Visual Studio</p></div>
              <div className="technology-item"><AiOutlineMoon /><p>CMS Cascade</p></div> {/* Updated CMS icon */}
            </div>
          </div>

          <div className="technology-category">
            <h3>Frameworks</h3>
            <div className="technology-items">
              <div className="technology-item"><SiDotnet /><p>ASP.NET</p></div>
              <div className="technology-item"><FaReact /><p>React</p></div>
              <div className="technology-item"><FaJs /><p>NodeJS</p></div>
            </div>
          </div>

          <div className="technology-category">
            <h3>UI/UX Design Tools</h3>
            <div className="technology-items">
              <div className="technology-item"><SiFigma /><p>Figma</p></div>
              <div className="technology-item"><SiAdobe /><p>Adobe Photoshop</p></div>
              <div className="technology-item"><SiCanva /><p>Canva</p></div> {/* Updated Canva icon */}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

export default Techstack;
