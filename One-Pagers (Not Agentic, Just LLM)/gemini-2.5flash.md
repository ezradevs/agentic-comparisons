That's a fantastic idea\! A sleek, modern one-pager is a great way to stand out.

I'll provide you with a **complete HTML file** that includes the CSS and a basic structure for a personal dashboard/resume. This design focuses on a clean, professional aesthetic using a dark sidebar, a light main content area, and a good use of spacing and typography.

-----

## Static One-Pager Resume/Personal Dashboard (HTML/CSS)

This single-file solution is easy to deploy and customize.

### Key Features of the Design:

  * **Sleek & Modern:** Uses a **dark sidebar** for personal details and a **light main section** for experience and projects.
  * **Clean & Professional:** Minimalist typography and a focus on white space.
  * **Responsive:** Basic responsiveness to look good on different screen sizes (though primarily designed for desktop viewing).

### `index.html` (Complete File)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jane Doe - Personal Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap" rel="stylesheet">
    <style>
        /* --- GLOBAL STYLES --- */
        :root {
            --primary-color: #007BFF; /* A vibrant blue for accents */
            --dark-bg: #212529; /* Dark charcoal for the sidebar */
            --light-bg: #f8f9fa; /* Off-white for the main content */
            --text-color: #343a40; /* Dark grey for body text */
            --light-text: #adb5bd; /* Light grey for sidebar body text */
            --white: #ffffff;
            --font-family: 'Roboto', sans-serif;
            --max-width: 1200px;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: var(--font-family);
            line-height: 1.6;
            color: var(--text-color);
            background-color: #e9ecef; /* Very light grey background for the page */
            padding: 20px;
        }

        /* --- DASHBOARD CONTAINER --- */
        .dashboard-container {
            display: flex;
            max-width: var(--max-width);
            margin: 0 auto;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            border-radius: 12px;
            overflow: hidden; /* Ensures content stays within rounded corners */
            min-height: 90vh; /* Make it tall enough to feel like a dashboard */
        }

        /* --- SIDEBAR (Personal Info) --- */
        .sidebar {
            flex: 0 0 320px; /* Fixed width for the sidebar */
            background-color: var(--dark-bg);
            color: var(--white);
            padding: 40px 30px;
            text-align: center;
        }

        .profile-photo {
            width: 140px;
            height: 140px;
            border-radius: 50%;
            object-fit: cover;
            border: 4px solid var(--primary-color);
            margin-bottom: 20px;
        }

        .name {
            font-size: 1.8rem;
            font-weight: 700;
            color: var(--white);
            margin-bottom: 5px;
        }

        .title {
            font-size: 1rem;
            font-weight: 300;
            color: var(--light-text);
            margin-bottom: 30px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .contact-info, .skills {
            text-align: left;
            margin-bottom: 30px;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .section-heading {
            font-size: 1.2rem;
            font-weight: 700;
            color: var(--primary-color);
            margin-bottom: 15px;
            text-transform: uppercase;
        }

        .contact-info p {
            font-size: 0.95rem;
            margin-bottom: 8px;
            color: var(--light-text);
        }

        .contact-info a {
            color: var(--white);
            text-decoration: none;
            transition: color 0.3s;
        }

        .contact-info a:hover {
            color: var(--primary-color);
        }

        .skills-list {
            list-style: none;
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .skill-tag {
            background-color: rgba(255, 255, 255, 0.1);
            color: var(--white);
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 0.85rem;
            font-weight: 400;
        }

        /* --- MAIN CONTENT (Resume Details) --- */
        .main-content {
            flex: 1;
            background-color: var(--white);
            padding: 40px;
        }

        .section {
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 1px solid #e9ecef;
        }

        .section:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }

        .main-heading {
            font-size: 2rem;
            font-weight: 700;
            color: var(--text-color);
            margin-bottom: 20px;
            border-left: 5px solid var(--primary-color);
            padding-left: 15px;
            line-height: 1.2;
        }

        .job-entry, .project-entry {
            margin-bottom: 30px;
        }

        .job-title, .project-title {
            font-size: 1.2rem;
            font-weight: 700;
            color: var(--text-color);
        }

        .company-name, .project-info {
            font-size: 1rem;
            font-weight: 400;
            color: var(--primary-color);
            margin-top: 3px;
        }

        .dates {
            font-size: 0.9rem;
            color: var(--light-text);
            margin-bottom: 10px;
        }

        .description-list {
            list-style: none;
            padding-left: 0;
        }

        .description-list li {
            position: relative;
            margin-bottom: 10px;
            padding-left: 20px;
            font-size: 0.95rem;
        }

        .description-list li::before {
            content: '•';
            color: var(--primary-color);
            font-weight: 700;
            display: inline-block;
            width: 1em;
            margin-left: -1em;
            position: absolute;
            left: 0;
        }

        /* --- MEDIA QUERIES for Mobile --- */
        @media (max-width: 800px) {
            .dashboard-container {
                flex-direction: column;
                border-radius: 0;
                min-height: auto;
            }

            .sidebar {
                flex: 1 1 auto;
                padding-bottom: 20px;
                text-align: left;
            }

            .main-content {
                padding: 30px;
            }

            .contact-info, .skills {
                text-align: left;
                padding-top: 0;
                border-top: none;
            }

            .skills-list {
                justify-content: flex-start;
            }

            .profile-photo-container {
                display: flex;
                align-items: center;
                gap: 20px;
                margin-bottom: 20px;
            }

            .profile-photo {
                margin-bottom: 0;
            }
        }

    </style>
</head>
<body>

    <div class="dashboard-container">
        <div class="sidebar">
            <div class="profile-photo-container">
                <img src="https://via.placeholder.com/140/007BFF/FFFFFF?text=JD" alt="Profile Picture" class="profile-photo">
                <div>
                    <h1 class="name">Jane Doe</h1>
                    <p class="title">Lead Software Architect</p>
                </div>
            </div>

            <div class="contact-info">
                <h2 class="section-heading">Contact</h2>
                <p><strong>Location:</strong> San Francisco, CA</p>
                <p><strong>Phone:</strong> (555) 123-4567</p>
                <p><strong>Email:</strong> <a href="mailto:jane.doe@example.com">jane.doe@example.com</a></p>
                <p><strong>LinkedIn:</strong> <a href="https://linkedin.com/in/janedoe" target="_blank">/in/janedoe</a></p>
                <p><strong>GitHub:</strong> <a href="https://github.com/janedoe" target="_blank">/janedoe</a></p>
            </div>

            <div class="skills">
                <h2 class="section-heading">Key Skills</h2>
                <ul class="skills-list">
                    <li class="skill-tag">React</li>
                    <li class="skill-tag">Node.js</li>
                    <li class="skill-tag">AWS</li>
                    <li class="skill-tag">Python</li>
                    <li class="skill-tag">Microservices</li>
                    <li class="skill-tag">Docker/K8s</li>
                    <li class="skill-tag">CI/CD</li>
                    <li class="skill-tag">MongoDB</li>
                </ul>
            </div>
            
            <div class="skills">
                <h2 class="section-heading">Education</h2>
                <p style="color: var(--white); margin-bottom: 5px;">M.S. Computer Science</p>
                <p style="color: var(--light-text); font-size: 0.9rem;">Stanford University, 2012</p>
            </div>
        </div>

        <div class="main-content">
            <header class="section">
                <h2 class="main-heading">Professional Summary</h2>
                <p>Highly accomplished and results-driven Lead Software Architect with 10+ years of experience designing and implementing scalable, high-performance distributed systems. Proven ability to lead cross-functional engineering teams and drive complex projects from concept to deployment.</p>
            </header>
            
            <section class="section">
                <h2 class="main-heading">Work Experience</h2>

                <div class="job-entry">
                    <h3 class="job-title">Lead Software Architect</h3>
                    <p class="company-name">Tech Innovators Inc.</p>
                    <p class="dates">Jan 2018 – Present</p>
                    <ul class="description-list">
                        <li>Directed the migration of monolithic architecture to a **microservices-based platform** using AWS, reducing latency by 40% and increasing deployment frequency.</li>
                        <li>Mentored a team of 15 engineers on best practices for scalable **Node.js** and **Python** backends, improving code quality scores by 25%.</li>
                        <li>Designed and implemented a new global caching layer using Redis, handling over **100,000 requests per second**.</li>
                    </ul>
                </div>

                <div class="job-entry">
                    <h3 class="job-title">Senior Full Stack Developer</h3>
                    <p class="company-name">Future Systems LLC</p>
                    <p class="dates">Jun 2014 – Dec 2017</p>
                    <ul class="description-list">
                        <li>Developed responsive, data-intensive user interfaces using **React** and Redux.</li>
                        <li>Contributed to the design of the core PostgreSQL database schema for the flagship product.</li>
                    </ul>
                </div>
            </section>

            <section class="section">
                <h2 class="main-heading">Key Projects</h2>

                <div class="project-entry">
                    <h3 class="project-title">Serverless API Gateway</h3>
                    <p class="project-info">AWS Lambda, API Gateway, Terraform</p>
                    <ul class="description-list">
                        <li>Created a fully serverless, pay-per-use API for a public dataset, cutting operational costs by 95%.</li>
                        <li>Infrastructure as Code managed with **Terraform** for repeatable, reliable deployment.</li>
                    </ul>
                </div>
            </section>

        </div>
    </div>

</body>
</html>
```

### How to Use and Customize:

1.  **Save the Code:** Copy the entire code block above and save it as an HTML file (e.g., `dashboard.html`).
2.  **Open in Browser:** Double-click the file to open it in any web browser. It's a static file, so it doesn't need a server to run.

#### Customization Tips:

  * **Photo:** Change the `src` attribute of the `<img>` tag in the sidebar to a link of your professional photo. The current one uses a placeholder image service.
      * *Example:* `<img src="your-photo.jpg" alt="Profile Picture" class="profile-photo">`
  * **Colors:** To change the main accent color (the blue), simply modify the `--primary-color` variable at the top of the `<style>` block:
      * `--primary-color: #A360FF;` (for a modern purple)
  * **Content:** Fill in the sections (`.contact-info`, `.skills`, `.job-entry`, etc.) with your specific professional information. Use the `description-list` for bullet points under your roles.
  * **Fonts:** The current design uses **Roboto** (a modern, clean sans-serif font). If you want a different Google Font, change the `<link>` tag and the `--font-family` variable.

Let me know if you have any specific feature you'd like to add or change, like a different color scheme or a progress bar for skills\!