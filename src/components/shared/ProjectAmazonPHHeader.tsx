"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { clsx } from "clsx";
import styles from "./header.module.css";

interface ProjectAmazonPHHeaderProps {
  projectName?: string;
  href?: string;
  className?: string;
}

const BRAND = {
  logo: "/project-amazon-ph-logo.svg",
  name: "ProjectAmazonPH",
  tagline: "Learn · Earn · Empower",
  url: "https://projectamazonph.com",
};

export function ProjectAmazonPHHeader({
  projectName,
  href = BRAND.url,
  className,
}: ProjectAmazonPHHeaderProps) {
  return (
    <div className={clsx(styles.root, className)}>
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.link}
        aria-label={`${BRAND.name} — ${projectName ?? "Home"}`}
      >
        <div className={styles.logoBox}>
          <Image
            src={BRAND.logo}
            alt={`${BRAND.name} logo`}
            fill
            className="object-contain p-1"
            sizes="36px"
          />
        </div>
        <div className={styles.textStack}>
          <span className={styles.brandName}>{BRAND.name}</span>
          <span className={styles.projectName}>{projectName ?? "Official Platform"}</span>
        </div>
      </Link>
    </div>
  );
}
