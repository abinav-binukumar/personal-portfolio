import React from 'react';
import { FaGithub, FaDocker, FaJira, FaJava, FaPython, FaJs, FaReact, FaNodeJs, FaLinux, FaAws, FaMicrosoft, FaCodeBranch } from 'react-icons/fa';
import { SiCplusplus, SiMongodb, SiKubernetes, SiGnubash, SiGithubactions, SiJenkins, SiFigma, SiAdobephotoshop, SiAdobeillustrator, SiExpress, SiGo, SiRedhat, SiMicrosoftazure, SiGoogle, SiWix } from 'react-icons/si';
import './techstack.scss';

const Techstack: React.FC = () => {
  return (
    <div className="about-technologies-container">
      <section className="about-technologies">
        <h2>My Techstack</h2>
        <div className="technology-categories">

          <div className="technology-category">
            <h3>Languages &amp; Databases</h3>
            <div className="technology-items">
              <div className="technology-item"><FaJava /><p>Java</p></div>
              <div className="technology-item"><SiCplusplus /><p>C++</p></div>
              <div className="technology-item"><FaPython /><p>Python</p></div>
              <div className="technology-item"><FaJs /><p>JavaScript</p></div>
              <div className="technology-item"><SiGo /><p>Go</p></div>
              <div className="technology-item"><SiGnubash /><p>Bash</p></div>
              <div className="technology-item"><SiMongodb /><p>MongoDB</p></div>
            </div>
          </div>

          <div className="technology-category">
            <h3>Cloud &amp; DevOps</h3>
            <div className="technology-items">
              <div className="technology-item"><SiKubernetes /><p>Kubernetes</p></div>
              <div className="technology-item"><FaDocker /><p>Docker</p></div>
              <div className="technology-item"><SiGithubactions /><p>GitHub Actions</p></div>
              <div className="technology-item"><SiJenkins /><p>Jenkins</p></div>
              <div className="technology-item"><FaCodeBranch /><p>GitOps</p></div>
              <div className="technology-item"><SiRedhat /><p>OpenShift</p></div>
              <div className="technology-item"><FaAws /><p>AWS (EKS)</p></div>
              <div className="technology-item"><SiMicrosoftazure /><p>Azure (AKS)</p></div>
              <div className="technology-item"><FaLinux /><p>Linux</p></div>
            </div>
          </div>

          <div className="technology-category">
            <h3>Frameworks</h3>
            <div className="technology-items">
              <div className="technology-item"><FaReact /><p>React</p></div>
              <div className="technology-item"><FaNodeJs /><p>Node.js</p></div>
              <div className="technology-item"><SiExpress /><p>Express</p></div>
            </div>
          </div>

          <div className="technology-category">
            <h3>Tools &amp; Platforms</h3>
            <div className="technology-items">
              <div className="technology-item"><FaGithub /><p>GitHub</p></div>
              <div className="technology-item"><FaJira /><p>Jira</p></div>
              <div className="technology-item"><SiGoogle /><p>Google Workspace</p></div>
              <div className="technology-item"><FaMicrosoft /><p>MS Office</p></div>
              <div className="technology-item"><SiWix /><p>Wix</p></div>
              <div className="technology-item"><SiFigma /><p>Figma</p></div>
              <div className="technology-item"><SiAdobephotoshop /><p>Photoshop</p></div>
              <div className="technology-item"><SiAdobeillustrator /><p>Illustrator</p></div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

export default Techstack;
