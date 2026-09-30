import React from 'react';
import './about.scss';

import Abinav from '../../assets/me/webp/Abinav.webp'; // Import your image

const About: React.FC = () => {
  return (
    <div className="about-container" id="about">
      <section className="about-intro">
        <div className="about-text">
          <h2 className="about-title">About Me</h2>
          <p>
            Hello! My name is <span className="purple-text">Abinav Binukumar</span>, a
            software engineer finishing my final year at <span className="purple-text">Ontario Tech University</span>
            {' '}(<span className="purple-text">3.99/4.3 CGPA</span>), graduating <span className="purple-text">May 2027</span>.
            I'm happiest when a system that used to be held together with duct tape isn't anymore.
          </p>
          <p>
            Most recently, I've been rebuilding <span className="purple-text">ElLemuel</span>'s entire web platform
            from a no-code Wix site into a fully self-hosted, full-stack platform - donation system, disaster recovery
            on AKS, the works - after a work term at <span className="purple-text">RBC</span> building multi-cloud
            Kubernetes automation that cut roughly <span className="purple-text">80%</span> of the manual workload off
            a 1,000+ repo GitHub migration and is projected to save over <span className="purple-text">$1M</span> in
            infrastructure costs.
          </p>
          <p>
            Along the way I've picked up <span className="purple-text">Java, C++, Python, and the MERN stack</span> for
            product work, and <span className="purple-text">Kubernetes, Docker, GitOps, and CI/CD</span> for
            infrastructure. I like tools that get out of the way so the product ships faster.
          </p>
          <p>
            Right now I'm building <span className="purple-text">AvidReader</span>, an AI-assisted reading dashboard,
            as my capstone, and co-founding <span className="purple-text">niya</span>, an AI-assisted hospital
            management platform for patients and staff alike.
          </p>
          <p>
            Outside of tech, you'll typically find me watching movies, exploring new towns, driving, and experimenting
            with new hobbies.
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
