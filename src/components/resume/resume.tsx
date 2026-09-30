import React, { useState } from 'react';
import './resume.scss';
import { FaDownload, FaChevronRight } from 'react-icons/fa';
import resumePdf from '../../assets/resume/Abinav-Binukumar-Resume.pdf';
import logoEllemuel from '../../assets/logos/ellemuel.png';
import logoRbc from '../../assets/logos/rbc.svg';
import logoOntarioTech from '../../assets/logos/ontario-tech.png';
import logoGtec from '../../assets/logos/gtec.webp';
import logoMathstronauts from '../../assets/logos/mathstronauts.png';

interface ExperienceEntry {
  title: string;
  company: string;
  initials: string;
  logo?: string;
  dates: string;
  bullets: string[];
  defaultOpen?: boolean;
}

interface EducationEntry {
  title: string;
  company: string;
  initials: string;
  logo?: string;
  /** Some logos (G-Tec's) have light text meant for a dark background. */
  logoDark?: boolean;
  dates: string;
  meta?: string;
}

const EDUCATION: EducationEntry[] = [
  {
    title: 'Bachelor of Engineering (Honours), Software Engineering',
    company: 'Ontario Tech University, Oshawa, ON',
    initials: 'OT',
    logo: logoOntarioTech,
    dates: 'Expected May 2027',
    meta: 'CGPA 3.99/4.3',
  },
  {
    title: 'Diploma in Graphics Design and Information Technology',
    company: 'G-Tec Education, India',
    initials: 'GT',
    logo: logoGtec,
    logoDark: true,
    dates: 'March 2021',
  },
];

const EXPERIENCE: ExperienceEntry[] = [
  {
    title: 'Software Developer',
    company: 'ElLemuel',
    initials: 'EL',
    logo: logoEllemuel,
    dates: 'September 2026 - Present',
    bullets: [
      "Re-architecting and rebuilding ElLemuel's Wix site from the ground up into a fully self-hosted, full-stack platform - swapping the no-code setup for custom application, hosting, and deployment infrastructure.",
      'Building a complete online donation system end-to-end: user-facing donation flows, backend processing, validation, and the workflows around them.',
      "Designing a low-cost cold-standby disaster recovery environment on AKS - containerized workloads, automated deployment, backups, and failover - so there's a real fallback if the primary platform ever goes down.",
      "Shipping two digital products in parallel: ElLemuel's main platform and a dedicated digital magazine for ReThread Living, with new features, integrations, and accessibility work on both.",
    ],
  },
  {
    title: 'Cloud Developer Intern',
    company: 'Royal Bank of Canada',
    initials: 'RB',
    logo: logoRbc,
    dates: 'January 2026 - August 2026',
    bullets: [
      'Built multi-cloud Kubernetes platform capabilities across three environments - AKS, EKS, and OpenShift - using Go, Kyverno, GitOps, and operator-based automation.',
      "Automated the migration of 1,000+ repositories from on-prem GitHub to GitHub Enterprise Cloud, cutting the on-prem environment's workload by roughly 80%.",
      'Modernized CI/CD by migrating Jenkins pipelines to GitHub Actions, building reusable automation for deployment, testing, validation, and day-to-day platform ops.',
      'Contributed to Kubernetes CPU/memory rightsizing work projected to save over $1M in infrastructure and licensing costs.',
    ],
  },
  {
    title: 'Open Education Resource Content Manager',
    company: 'Ontario Tech University',
    initials: 'OT',
    logo: logoOntarioTech,
    dates: 'January 2025 - December 2025',
    bullets: [
      'Built 50+ interactive learning activities and digital resources with H5P, Pressbooks, and 3D content tools for university courses.',
      'Turned dense academic and technical material into clear, interactive, accessible digital learning experiences.',
      "Worked with faculty to keep everything aligned with the university's accessibility, usability, and publishing standards.",
    ],
  },
  {
    title: 'Software Developer Intern',
    company: 'EmpowHer Initiatives Inc.',
    initials: 'EH',
    dates: 'June 2024 - August 2024',
    bullets: [
      "Built a React Native app spanning user-facing features and backend integration, as part of a small team shipping an MVP for a community-focused women's empowerment initiative.",
      'Picked up unfamiliar tech on the fly alongside the team lead to help fast-track the MVP, implementing features quickly while requirements kept shifting.',
      'Applied UI/UX principles and iterative testing while handling secure data and debugging along the way.',
    ],
  },
  {
    title: 'STEM Instructor',
    company: 'Mathstronauts',
    initials: 'MS',
    logo: logoMathstronauts,
    dates: 'April 2025 - July 2025',
    bullets: [
      'Taught Scratch coding to grades 6-8, introducing programming through hands-on projects.',
      'Helped build a fun, engaging learning environment as part of the STEAM Engine initiative.',
    ],
  },
  {
    title: 'Communication Assistant',
    company: 'Ontario Tech University',
    initials: 'OT',
    logo: logoOntarioTech,
    dates: 'May 2024 - August 2024',
    bullets: [
      "Updated and maintained the Engineering Faculty's webpages using Cascade CMS, redesigning page layouts along the way.",
      'Managed project workflow in Jira - tracking tasks, organizing work, and keeping deadlines on track.',
    ],
  },
];

// LinkedIn-style logo badge - falls back to a colored initials monogram
// (same pattern LinkedIn itself uses when a company has no logo on file).
// LinkedIn-style company badge: a real logo on a white card when we have
// one, otherwise a colored initials monogram (LinkedIn's own fallback).
const CompanyLogo: React.FC<{ initials: string; logo?: string; logoDark?: boolean; company: string }> = ({
  initials,
  logo,
  logoDark,
  company,
}) =>
  logo ? (
    <span className={`company-logo company-logo--image ${logoDark ? 'company-logo--on-dark' : ''}`}>
      <img src={logo} alt={`${company} logo`} />
    </span>
  ) : (
    <span className={`company-logo logo-${initials.toLowerCase()}`} aria-hidden="true">
      {initials}
    </span>
  );

const ExperienceItem: React.FC<ExperienceEntry> = ({ title, company, initials, logo, dates, bullets, defaultOpen }) => {
  const [open, setOpen] = useState(!!defaultOpen);

  return (
    <div className={`tree-item ${open ? 'is-open' : ''}`}>
      <button
        type="button"
        className="tree-item-header"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <FaChevronRight className="chevron" aria-hidden="true" />
        <CompanyLogo initials={initials} logo={logo} company={company} />
        <span className="tree-item-text">
          <span className="tree-item-title">
            {title} <span className="company">@{company}</span>
          </span>
          <span className="tree-item-dates">{dates}</span>
        </span>
      </button>
      {open && (
        <ul className="tree-item-body">
          {bullets.map((b) => (
            <li key={b} className="bullet-point">
              {b}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const EducationItem: React.FC<EducationEntry> = ({ title, company, initials, logo, logoDark, dates, meta }) => (
  <div className="tree-item tree-item--leaf">
    <div className="tree-item-header tree-item-header--static">
      <CompanyLogo initials={initials} logo={logo} logoDark={logoDark} company={company} />
      <span className="tree-item-text">
        <span className="tree-item-title">
          {title} <span className="company">@{company}</span>
        </span>
        <span className="tree-item-dates">{dates}</span>
        {meta && <span className="tree-item-meta">{meta}</span>}
      </span>
    </div>
  </div>
);

const TreeFolder: React.FC<{ name: string; children: React.ReactNode }> = ({ name, children }) => {
  const [open, setOpen] = useState(true);

  return (
    <div className={`tree-folder ${open ? 'is-open' : ''}`}>
      <button type="button" className="tree-folder-name" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <FaChevronRight className="chevron chevron--folder" aria-hidden="true" />
        {name}/
      </button>
      {open && <div className="tree-folder-items">{children}</div>}
    </div>
  );
};

const Resume: React.FC = () => {
  return (
    <div className="resume-container" id="resume">
      <div className="resume-header">
        <h1 className="section-title">Resume</h1>
        <a
          className="download-button"
          href={resumePdf}
          download="Abinav Binukumar - Resume.pdf"
        >
          <FaDownload />
          Download PDF
        </a>
      </div>

      <div className="content-wrapper">
        <div className="left-column terminal-tree">
          <div className="terminal-prompt">
            <span className="prompt-user">abinav@portfolio</span>
            <span className="prompt-colon">:</span>
            <span className="prompt-path">~</span>
            <span className="prompt-dollar">$</span> ls -la ./resume
          </div>

          <TreeFolder name="education">
            {EDUCATION.map((entry) => (
              <EducationItem key={entry.title} {...entry} />
            ))}
          </TreeFolder>

          <TreeFolder name="experience">
            {EXPERIENCE.map((entry) => (
              <ExperienceItem key={entry.title + entry.company} {...entry} />
            ))}
          </TreeFolder>
        </div>

        <div className="right-column pdf-preview">
          <embed src={resumePdf} type="application/pdf" title="Abinav Binukumar Resume" />
        </div>
      </div>
    </div>
  );
};

export default Resume;
