export type SourceMode = "video" | "photo" | "text" | "motion";
export type SubjectKind = "people" | "pets" | "other";
export type ResourceTopic =
  | "all"
  | "create"
  | "examples"
  | "tutorial"
  | "pricing"
  | "policy";

function clean(value: string | undefined) {
  return (value || "").replace(/\s+/g, " ").trim();
}

function cleanList(values: string[] | undefined) {
  return (values || []).map(clean).filter(Boolean);
}

function unique(values: string[]) {
  return [...new Set(values)];
}

export function buildHotelLobbyPrompt(params: {
  mode: SourceMode;
  subjectKind: SubjectKind;
  performerCount: 1 | 2;
  performanceAction: string;
  performerDirections?: string[] | undefined;
  cameraDirection?: string | undefined;
  lightingAndStyle?: string | undefined;
  audioDirection?: string | undefined;
  referenceRoles?: string[] | undefined;
  exclusions?: string[] | undefined;
  rightsConfirmed: boolean;
  originalSceneConfirmed: boolean;
}) {
  const directions = cleanList(params.performerDirections);
  const references = cleanList(params.referenceRoles);
  const exclusions = unique([
    "extra performers",
    "watermarks",
    "logos",
    "captions or accidental text",
    ...cleanList(params.exclusions),
  ]);
  const blockers = [
    !params.rightsConfirmed
      ? "Confirm permission to use every supplied photo, video, and audio reference."
      : "",
    !params.originalSceneConfirmed
      ? "Confirm that the result will be an original scene, not a reproduction of an existing performance, song, person, setting, or sequence of frames."
      : "",
    !clean(params.performanceAction)
      ? "Describe the performance action."
      : "",
    params.mode === "motion" && references.length === 0
      ? "Describe the motion reference and state that it guides movement only."
      : "",
  ].filter(Boolean);

  const singularSubject =
    params.subjectKind === "people"
      ? "performer"
      : params.subjectKind === "pets"
        ? "pet"
        : "subject";
  const subjects =
    params.performerCount === 2
      ? `two ${params.subjectKind === "people" ? "performers" : params.subjectKind}, one on camera-left and one on camera-right`
      : `one ${singularSubject}, centered`;
  const clauses = [
    `Create an original ${subjects} in a warm orange performance booth with one vintage silver microphone.`,
    clean(params.performanceAction),
    directions.length > 0
      ? `Performance directions: ${directions.join("; ")}.`
      : params.performerCount === 2
        ? "Keep both performers visually distinct, facing the microphone with coordinated but non-identical gestures."
        : "Keep the subject facing the microphone with natural performance gestures.",
    clean(params.cameraDirection)
      ? `Camera: ${clean(params.cameraDirection)}.`
      : "Camera: stable medium framing with gentle performance-driven movement and clear facial visibility.",
    clean(params.lightingAndStyle)
      ? `Lighting and style: ${clean(params.lightingAndStyle)}.`
      : "Lighting and style: warm saturated orange, clean studio contrast, realistic texture, polished short-form music-video energy.",
    params.subjectKind === "pets"
      ? "Preserve the animals' species, anatomy, coat markings, and natural limb motion."
      : "Preserve the supplied subjects' recognizable visual traits without claiming perfect identity reproduction.",
    references.length > 0
      ? `Reference roles: ${references.join("; ")}. Use them only for the stated identity, composition, motion, or audio guidance.`
      : "No unstated reference media is assumed.",
    params.mode === "motion"
      ? "The motion clip guides movement and timing only; create fresh people, setting, camera coverage, and frames."
      : "Create fresh staging, camera coverage, and frames.",
    clean(params.audioDirection)
      ? `Audio: ${clean(params.audioDirection)}. Use only user-owned or properly licensed audio.`
      : "Audio: no unlicensed song, voice clone, or recognizable recording is requested.",
    `Exclude ${exclusions.join(", ")}.`,
  ].filter(Boolean);

  return {
    ready: blockers.length === 0,
    blockers,
    prompt: clauses.join(" "),
    mode: params.mode,
    referenceRoles: references,
    assumptions: [
      "The orange-booth concept is a visual direction for a new work, not a request to copy an existing performance.",
      "The generation model and live product settings may interpret prompts differently.",
    ],
    boundary:
      "This helper only drafts text. It does not upload media, generate content, call a provider, access an account, spend credits, or submit a payment.",
  };
}

export type DuetBeat = {
  durationSeconds: number;
  leftAction: string;
  rightAction: string;
  camera?: string | undefined;
  transition?: string | undefined;
};

export function planHotelLobbyDuet(params: {
  durationSeconds: number;
  aspectRatio: string;
  beats: DuetBeat[];
  continuityAnchors?: string[] | undefined;
}) {
  const supportedDurations = [4, 10, 15];
  const supportedRatios = ["9:16", "16:9"];
  const beats = params.beats.map((beat, index) => ({
    beat: index + 1,
    durationSeconds: beat.durationSeconds,
    leftAction: clean(beat.leftAction),
    rightAction: clean(beat.rightAction),
    camera: clean(beat.camera) || "Hold both performers and the microphone in a readable composition.",
    transition: clean(beat.transition) || "Continue naturally into the next beat.",
  }));
  const plannedDuration = Number(
    beats.reduce((total, beat) => total + beat.durationSeconds, 0).toFixed(2),
  );
  const errors = [
    plannedDuration !== params.durationSeconds
      ? `Beat durations total ${plannedDuration}s, but the requested duration is ${params.durationSeconds}s.`
      : "",
    beats.some((beat) => !beat.leftAction || !beat.rightAction)
      ? "Every beat needs both a camera-left and camera-right action."
      : "",
  ].filter(Boolean);
  const warnings = [
    !supportedDurations.includes(params.durationSeconds)
      ? "The current AI Hotel Lobby template advertises 4, 10, and 15 second options; verify availability before generation."
      : "",
    !supportedRatios.includes(params.aspectRatio)
      ? "The current template advertises 9:16 and 16:9; verify the requested ratio before generation."
      : "",
  ].filter(Boolean);

  return {
    ready: errors.length === 0,
    errors,
    warnings,
    durationSeconds: params.durationSeconds,
    aspectRatio: clean(params.aspectRatio),
    beats,
    continuityAnchors: unique([
      "one vintage silver microphone remains in the same stage position",
      "camera-left and camera-right performers do not swap identities",
      "warm orange booth lighting remains consistent",
      ...cleanList(params.continuityAnchors),
    ]),
  };
}

const imitationTerms =
  /\b(COLORS?|Quavo|Migos|Takeoff|exact copy|original song|same frames?|recreate exactly)\b/i;

export function diagnoseHotelLobbyPrompt(params: {
  prompt: string;
  mode: SourceMode;
  performerCount: 1 | 2;
  imageReferenceCount: number;
  hasMotionReference: boolean;
  hasAudioReference: boolean;
  audioRequested: boolean;
  durationSeconds: number;
  aspectRatio: string;
  rightsConfirmed: boolean;
}) {
  const prompt = clean(params.prompt);
  const blockers = [
    !params.rightsConfirmed
      ? "Rights or permission for all supplied references has not been confirmed."
      : "",
    !prompt ? "A prompt is required." : "",
    params.mode === "motion" && !params.hasMotionReference
      ? "Motion mode needs an authorized motion reference."
      : "",
    params.mode === "video" && params.imageReferenceCount < params.performerCount
      ? `Video mode needs ${params.performerCount} authorized performer image reference${params.performerCount === 1 ? "" : "s"}.`
      : "",
  ].filter(Boolean);
  const warnings = [
    prompt.length > 2500
      ? "The prompt is long and may exceed some selected workflows; verify the live limit."
      : "",
    params.mode === "text" &&
    (params.imageReferenceCount > 0 || params.hasMotionReference)
      ? "Text mode includes reference media; confirm that the intended workflow supports it."
      : "",
    params.mode !== "motion" && params.hasMotionReference
      ? "A motion reference is present outside motion mode."
      : "",
    params.mode === "photo" && (params.audioRequested || params.hasAudioReference)
      ? "Audio settings do not apply to a still-image result."
      : "",
    ![4, 10, 15].includes(params.durationSeconds)
      ? "The current AI Hotel Lobby template advertises 4, 10, and 15 second options; verify availability."
      : "",
    !["9:16", "16:9"].includes(clean(params.aspectRatio))
      ? "The current template advertises 9:16 and 16:9; verify the requested ratio."
      : "",
    imitationTerms.test(prompt)
      ? "The wording may request a named or exact reproduction. Reframe it as an original orange-booth performance and use only licensed audio and authorized references."
      : "",
    params.performerCount === 2 && !/left|right|camera-left|camera-right/i.test(prompt)
      ? "Assign stable camera-left and camera-right roles to reduce identity swaps."
      : "",
    !/microphone|mic\b/i.test(prompt)
      ? "Specify the microphone and its fixed stage position."
      : "",
    !/orange/i.test(prompt)
      ? "Describe the intended orange booth or choose a different original setting explicitly."
      : "",
    !/camera|shot|framing|close-up|medium|wide/i.test(prompt)
      ? "Add camera or framing direction."
      : "",
    params.audioRequested && !/audio|sound|music|voice|vocal|silent/i.test(prompt)
      ? "Add an audio direction and confirm the audio is owned or licensed."
      : "",
  ].filter(Boolean);

  return {
    ready: blockers.length === 0,
    blockers,
    warnings: unique(warnings),
    checks: {
      hasStablePerformerPositions:
        params.performerCount === 1 || /left|right|camera-left|camera-right/i.test(prompt),
      hasMicrophoneDirection: /microphone|mic\b/i.test(prompt),
      hasSettingDirection: /orange|booth|studio|stage/i.test(prompt),
      hasCameraDirection: /camera|shot|framing|close-up|medium|wide/i.test(prompt),
      hasAudioDirection:
        !params.audioRequested || /audio|sound|music|voice|vocal|silent/i.test(prompt),
    },
    nextStep:
      blockers.length > 0
        ? "Resolve every blocker before using the prompt."
        : warnings.length > 0
          ? "Revise the warnings, then verify the selected live workflow and credit estimate."
          : "The prompt is structurally ready; verify live settings and the credit estimate before generation.",
  };
}

const resources = [
  {
    topic: "create",
    title: "Hotel Lobby Video Generator",
    path: "/hotel-lobby-video",
    purpose: "Create an original two-person orange-booth performance from photos.",
  },
  {
    topic: "create",
    title: "Hotel Lobby Photo Effect",
    path: "/hotel-lobby-ai-filter",
    purpose: "Create a still image in the original orange-studio concept.",
  },
  {
    topic: "create",
    title: "Hotel Lobby Image Generator",
    path: "/hotel-lobby-image",
    purpose: "Create original Hotel Lobby-style AI images.",
  },
  {
    topic: "examples",
    title: "Hotel Lobby AI Video Examples",
    path: "/hotel-lobby-ai-video-examples",
    purpose: "Review example structures and prompt ideas.",
  },
  {
    topic: "tutorial",
    title: "Hotel Lobby AI Trend Tutorial",
    path: "/how-to-do-hotel-lobby-ai-trend",
    purpose: "Follow the current creation workflow and rights guidance.",
  },
  {
    topic: "tutorial",
    title: "Workflow Comparison",
    path: "/higgsfield-hotel-lobby-alternative",
    purpose: "Compare the browser-based workflow with another approach.",
  },
  {
    topic: "pricing",
    title: "Pricing",
    path: "/pricing",
    purpose: "Check current plans, credits, and product terms before generation.",
  },
  {
    topic: "policy",
    title: "Privacy Policy",
    path: "/privacy",
    purpose: "Review current data-handling terms.",
  },
  {
    topic: "policy",
    title: "Terms of Service",
    path: "/terms",
    purpose: "Review current usage and rights terms.",
  },
] as const;

export function getHotelLobbyResources(
  appBaseUrl: string,
  topic: ResourceTopic,
) {
  return resources
    .filter((item) => topic === "all" || item.topic === topic)
    .map((item) => ({ ...item, url: `${appBaseUrl}${item.path}` }));
}
