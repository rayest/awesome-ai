"use client";

import { starProfilesFor, type StarProfile, type TeamSnapshot } from "@/data/predictions";
import { flagImageSrc, playerImageSrc, REAL_IMAGE_FALLBACK_SRC, REAL_STADIUM_BACKGROUND_SRC, teamImageSrc } from "./visuals";
import VisualImage from "./VisualImage";
import type { CSSProperties } from "react";

const arcPoints = [
  { x: "18%", y: "78%" },
  { x: "40%", y: "30%" },
  { x: "60%", y: "30%" },
  { x: "82%", y: "78%" }
];

function StarArcTimeline({
  profile,
  team
}: {
  profile: StarProfile;
  team: TeamSnapshot;
}) {
  return (
    <article className="star-arc-card">
      <div className="star-arc-head">
        <VisualImage
          alt={`${profile.name} 头像`}
          className="star-arc-photo"
          fallbackSrc={REAL_IMAGE_FALLBACK_SRC}
          src={playerImageSrc(profile.wikiTitle)}
        />
        <div>
          <span>{team.name}</span>
          <strong>{profile.name}</strong>
          <small>{profile.role}</small>
        </div>
      </div>
      <p>{profile.summary}</p>
      <div className="arc-timeline" aria-label={`${profile.name} 履历时间线`}>
        <div className="arc-line" aria-hidden="true" />
        {profile.timeline.slice(0, 4).map((event, index) => {
          const point = arcPoints[index] ?? arcPoints[arcPoints.length - 1];
          return (
            <div
              className="arc-event"
              key={`${profile.name}-${event.year}-${event.title}`}
              style={{ "--arc-x": point.x, "--arc-y": point.y } as CSSProperties}
            >
              <b>{event.year}</b>
              <strong>{event.title}</strong>
              <span>{event.detail}</span>
            </div>
          );
        })}
      </div>
    </article>
  );
}

export default function TeamStarsPanel({
  team,
  variant = "detail"
}: {
  team: TeamSnapshot;
  variant?: "detail" | "atlas";
}) {
  return (
    <section className={`team-stars-panel team-stars-${variant}`}>
      <VisualImage
        alt={`${team.name} 国家队相关图片`}
        className="team-national-photo"
        fallbackSrc={REAL_STADIUM_BACKGROUND_SRC}
        src={teamImageSrc(team)}
      />
      <div className="stars-panel-title">
        <VisualImage alt={`${team.name} 国旗`} className="mini-panel-flag" src={flagImageSrc(team)} />
        <h3>{team.name} 当家球星履历</h3>
      </div>
      <div className="star-arc-list">
        {starProfilesFor(team).map((profile) => (
          <StarArcTimeline key={`${team.shortName}-${profile.name}`} profile={profile} team={team} />
        ))}
      </div>
    </section>
  );
}
