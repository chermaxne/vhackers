import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

def create_resume(path, name, contact, summary, comps, exps, degree, cert, grant):
    doc = SimpleDocTemplate(path, pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    name_s = ParagraphStyle("N", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=16, leading=20, alignment=TA_CENTER)
    cont_s = ParagraphStyle("C", parent=styles["Normal"], fontName="Helvetica", fontSize=8.5, leading=11, alignment=TA_CENTER, textColor=HexColor("#4A5568"))
    hdr_s = ParagraphStyle("H", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=10, leading=12, textColor=HexColor("#1A202C"))
    body_s = ParagraphStyle("B", parent=styles["Normal"], fontName="Helvetica", fontSize=8.5, leading=11.5, textColor=HexColor("#2D3748"))
    bullet_s = ParagraphStyle("BL", parent=styles["Normal"], fontName="Helvetica", fontSize=8.5, leading=11.5, textColor=HexColor("#2D3748"), leftIndent=10, firstLineIndent=-10)

    story = [Paragraph(name, name_s), Spacer(1, 2), Paragraph(contact, cont_s), Spacer(1, 8)]

    def add_h(t):
        story.extend([Paragraph(t.upper(), hdr_s), Spacer(1, 2), HRFlowable(width="100%", thickness=0.75, color=HexColor("#718096"), spaceBefore=1, spaceAfter=5)])

    add_h("Professional Summary")
    story.extend([Paragraph(summary, body_s), Spacer(1, 7)])

    add_h("Core Competencies & Skills")
    for k, v in comps:
        story.extend([Paragraph(f"• <b>{k}:</b> {v}", bullet_s), Spacer(1, 1.5)])
    story.append(Spacer(1, 5))

    add_h("Professional Experience")
    for title, comp, loc, dates, bullets in exps:
        tbl = Table([[Paragraph(f"<b>{title}</b> | {comp}", body_s), Paragraph(f"<i>{loc}</i>", ParagraphStyle("R1", parent=body_s, alignment=TA_RIGHT))],
                     [Paragraph("", body_s), Paragraph(f"<i>{dates}</i>", ParagraphStyle("R2", parent=body_s, alignment=TA_RIGHT))]], colWidths=[380, 160])
        tbl.setStyle(TableStyle([("VALIGN", (0,0), (-1,-1), "TOP"), ("BOTTOMPADDING", (0,0), (-1,-1), 0), ("TOPPADDING", (0,0), (-1,-1), 0), ("LEFTPADDING", (0,0), (-1,-1), 0), ("RIGHTPADDING", (0,0), (-1,-1), 0)]))
        story.extend([tbl, Spacer(1, 2)])
        for b in bullets:
            story.extend([Paragraph(f"• {b}", bullet_s), Spacer(1, 1.5)])
        story.append(Spacer(1, 5))

    add_h("Education & Credentials")
    tbl_edu = Table([[Paragraph(degree, body_s), Paragraph("Singapore", ParagraphStyle("R3", parent=body_s, alignment=TA_RIGHT))]], colWidths=[400, 140])
    tbl_edu.setStyle(TableStyle([("VALIGN", (0,0), (-1,-1), "TOP"), ("BOTTOMPADDING", (0,0), (-1,-1), 0), ("TOPPADDING", (0,0), (-1,-1), 0), ("LEFTPADDING", (0,0), (-1,-1), 0), ("RIGHTPADDING", (0,0), (-1,-1), 0)]))
    story.extend([tbl_edu, Spacer(1, 2), Paragraph(f"• <b>Certifications:</b> {cert}", bullet_s), Spacer(1, 1.5), Paragraph(f"• <b>Grant Eligibility:</b> {grant}", bullet_s)])

    doc.build(story)

if __name__ == "__main__":
    os.makedirs("public/sample_resumes", exist_ok=True)

    create_resume("public/sample_resumes/jonathan_tan_resume.pdf", "Jonathan Tan",
        "Singapore | +65 9123 4567 | jonathan.tan@email.com | linkedin.com/in/jonathan-tan-demo",
        "Senior Software Engineer with 8+ years leading distributed systems in enterprise SaaS and FinTech. Pivoting into Technology Consulting, leveraging systems architecture, Agile sprint leadership, and client scoping.",
        [("Transferable Strengths", "Technical Scoping, Stakeholder Reporting, Agile Sprint Planning, Requirements Translation"),
         ("Technical Proficiencies", "Python, TypeScript, React, Node.js, REST APIs, Microservices, PostgreSQL, CI/CD"),
         ("Target Domain Focus", "Enterprise Cloud Architecture (AWS), Vendor Management, Digital Transformation Advisory")],
        [("Lead Software Engineer", "Nexus Solutions Pte Ltd", "Singapore", "2021 – Present",
          ["Lead team of 6 engineers delivering mission-critical B2B SaaS payment integrations for enterprise clients.",
           "Spearhead technical scoping sessions with client product directors to convert business needs to technical specs.",
           "Conduct bi-weekly demos translating technical blocker metrics into commercial and financial impact statements.",
           "Redesigned core transactional API architecture, cutting latency by 32% and onboarding S$1.4M in annual volume."]),
         ("Software Engineer", "Apex FinTech Singapore", "Singapore", "2018 – 2021",
          ["Engineered backend microservices in Python and Node.js for automated portfolio rebalancing engines.",
           "Partnered with compliance teams to implement automated regulatory transaction monitoring workflows.",
           "Authored comprehensive technical architecture documentation, API playbooks, and client onboarding guides."])],
        "<b>Bachelor of Computing in Computer Science</b>, National University of Singapore (NUS)",
        "Certified ScrumMaster (CSM) — 2022", "SkillsFuture Credit Balance: S$500")

    create_resume("public/sample_resumes/samantha_lim_resume.pdf", "Samantha Lim",
        "Singapore | +65 8234 5678 | samantha.lim@email.com | linkedin.com/in/samantha-lim-demo",
        "Results-driven Human Resource Specialist with 4 years managing talent operations and workforce metrics in tech environments. Combines business foundation with data modeling, utilizing HRIS and Excel to diagnose retention risks and optimize pipelines.",
        [("Transferable Strengths", "Advanced Excel Modeling (VLOOKUP, Pivot Tables), Stakeholder Reporting, Process Optimization"),
         ("Domain & Tooling", "Workday, BambooHR, Google Workspace, SurveyMonkey Enterprise, Basic SQL"),
         ("Target Domain Focus", "Production SQL, PowerBI / Tableau Visualizations, People Analytics, Cohort Attrition Modeling")],
        [("People Operations & Talent Specialist", "Horizon Digital Asia", "Singapore", "2022 – Present",
          ["Manage end-to-end talent acquisition and onboarding operations for regional headcount of 180+ staff across SEA.",
           "Consolidate monthly talent metrics into Excel models tracking cost-per-hire, time-to-fill, and 90-day attrition.",
           "Designed onboarding satisfaction survey pipeline increasing internal new-hire response rates from 45% to 88%.",
           "Partner with department leads to scope headcount requirements and reconcile talent budgets against market rates."]),
         ("Human Resources Associate", "Capita Enterprise Partners", "Singapore", "2020 – 2022",
          ["Administered employee lifecycle records, benefits enrolment, and appraisal schedules across 3 business units.",
           "Audited internal HRIS workforce records to resolve discrepancies across compensation and leave datasets.",
           "Authored quarterly summaries analyzing exit-interview feedback to isolate churn factors across teams."])],
        "<b>Bachelor of Business Administration (BBA)</b>, Nanyang Technological University (NTU)",
        "Data Analytics & Dashboard Fundamentals (Certificate of Completion) — 2023", "SkillsFuture Credit Balance: S$500")

    print("SUCCESS: Resumes generated in public/sample_resumes/")
