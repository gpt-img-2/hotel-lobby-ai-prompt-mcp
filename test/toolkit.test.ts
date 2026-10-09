import assert from "node:assert/strict";
import test from "node:test";
import {
  buildHotelLobbyPrompt,
  diagnoseHotelLobbyPrompt,
  getHotelLobbyResources,
  planHotelLobbyDuet,
} from "../src/toolkit.js";

test("blocks prompt use until rights and originality are confirmed", () => {
  const result = buildHotelLobbyPrompt({
    mode: "video",
    subjectKind: "people",
    performerCount: 2,
    performanceAction: "Trade short verses and gesture to the beat",
    rightsConfirmed: false,
    originalSceneConfirmed: false,
  });
  assert.equal(result.ready, false);
  assert.equal(result.blockers.length, 2);
});

test("builds an original two-performer prompt", () => {
  const result = buildHotelLobbyPrompt({
    mode: "video",
    subjectKind: "people",
    performerCount: 2,
    performanceAction: "Trade short verses and gesture to the beat",
    rightsConfirmed: true,
    originalSceneConfirmed: true,
  });
  assert.equal(result.ready, true);
  assert.match(result.prompt, /camera-left/);
  assert.match(result.prompt, /vintage silver microphone/);
  assert.match(result.boundary, /does not upload media/);
});

test("keeps pet anatomy instructions", () => {
  const result = buildHotelLobbyPrompt({
    mode: "photo",
    subjectKind: "pets",
    performerCount: 2,
    performanceAction: "Pose on opposite sides of the microphone",
    rightsConfirmed: true,
    originalSceneConfirmed: true,
  });
  assert.match(result.prompt, /species, anatomy, coat markings/);
});

test("uses a neutral noun for one other subject", () => {
  const result = buildHotelLobbyPrompt({
    mode: "text",
    subjectKind: "other",
    performerCount: 1,
    performanceAction: "Deliver a short original performance",
    rightsConfirmed: true,
    originalSceneConfirmed: true,
  });
  assert.match(result.prompt, /one subject, centered/);
  assert.doesNotMatch(result.prompt, /one othe/);
});

test("validates duet timing", () => {
  const result = planHotelLobbyDuet({
    durationSeconds: 10,
    aspectRatio: "9:16",
    beats: [
      { durationSeconds: 4, leftAction: "opens", rightAction: "nods" },
      { durationSeconds: 5, leftAction: "listens", rightAction: "answers" },
    ],
  });
  assert.equal(result.ready, false);
  assert.match(result.errors[0] || "", /total 9s/);
});

test("diagnoses named reproduction and missing shot details", () => {
  const result = diagnoseHotelLobbyPrompt({
    prompt: "Recreate exactly the original Quavo song",
    mode: "video",
    performerCount: 2,
    imageReferenceCount: 2,
    hasMotionReference: false,
    hasAudioReference: false,
    audioRequested: true,
    durationSeconds: 10,
    aspectRatio: "9:16",
    rightsConfirmed: true,
  });
  assert.equal(result.ready, true);
  assert.ok(result.warnings.some((warning) => /named or exact reproduction/.test(warning)));
  assert.equal(result.checks.hasMicrophoneDirection, false);
});

test("resources use the configured origin", () => {
  const result = getHotelLobbyResources("https://aihotellobby.art", "create");
  assert.equal(result.length, 3);
  assert.ok(result.every((item) => item.url.startsWith("https://aihotellobby.art/")));
});
