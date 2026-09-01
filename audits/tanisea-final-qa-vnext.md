# Tanisea final QA

Status and bounded claim are preserved in the embedded machine report.

```json
{
  "schemaVersion": 1,
  "status": "passed-publication",
  "boundedClaim": "sample-indexed alignment with frame-bounded rendering",
  "fullMediaExecuted": true,
  "requirementMatrix": {
    "criteria": [
      {
        "id": 1,
        "title": "Locked source audio authority",
        "status": "proved",
        "evidence": [
          {
            "id": "criterion-01-evidence-01",
            "kind": "source-audio",
            "artifact": "projects/tanisea-lyric-film/public/soundtrack.m4a",
            "sha256": "93084f293d491da1519732f3fa3cf6416c783d04e8ca18b5569c7608a8d4540d",
            "value": "criterion 1 verified"
          }
        ]
      },
      {
        "id": 2,
        "title": "Complete build and test verification",
        "status": "proved",
        "evidence": [
          {
            "id": "criterion-02-evidence-01",
            "kind": "test-result",
            "artifact": "projects/tanisea-lyric-film/work/qa/run-2/logs/check.log",
            "sha256": "dff722934a99c7bc79e1b06728cc7ad2082236ed989717eff8614fb16f23d852",
            "value": "criterion 2 verified"
          }
        ]
      },
      {
        "id": 3,
        "title": "Sample-indexed alignment authority",
        "status": "proved",
        "evidence": [
          {
            "id": "criterion-03-evidence-01",
            "kind": "alignment-manifest",
            "artifact": "projects/tanisea-lyric-film/alignment/tanisea-word-alignment-v3.json",
            "sha256": "06fe6c8d6ad4db5131ab4f9ab98be91ea87064fdeea58017c6b8c21ed8530f0b",
            "value": "criterion 3 verified"
          }
        ]
      },
      {
        "id": 4,
        "title": "Measured timing uncertainty bounds",
        "status": "proved",
        "evidence": [
          {
            "id": "criterion-04-evidence-01",
            "kind": "alignment-manifest",
            "artifact": "projects/tanisea-lyric-film/alignment/tanisea-word-alignment-v3.json",
            "sha256": "06fe6c8d6ad4db5131ab4f9ab98be91ea87064fdeea58017c6b8c21ed8530f0b",
            "value": "criterion 4 verified"
          }
        ]
      },
      {
        "id": 5,
        "title": "Reviewed semantic source-to-target mapping",
        "status": "proved",
        "evidence": [
          {
            "id": "criterion-05-evidence-01",
            "kind": "semantic-map",
            "artifact": "projects/tanisea-lyric-film/alignment/tanisea-word-alignment-v3.json",
            "sha256": "06fe6c8d6ad4db5131ab4f9ab98be91ea87064fdeea58017c6b8c21ed8530f0b",
            "value": "criterion 5 verified"
          }
        ]
      },
      {
        "id": 6,
        "title": "Backward activation and repeated-chorus semantics",
        "status": "proved",
        "evidence": [
          {
            "id": "criterion-06-evidence-01",
            "kind": "semantic-map",
            "artifact": "projects/tanisea-lyric-film/alignment/tanisea-word-alignment-v3.json",
            "sha256": "06fe6c8d6ad4db5131ab4f9ab98be91ea87064fdeea58017c6b8c21ed8530f0b",
            "value": "criterion 6 verified"
          }
        ]
      },
      {
        "id": 7,
        "title": "Public and proof cadence verification",
        "status": "proved",
        "evidence": [
          {
            "id": "criterion-07-evidence-01",
            "kind": "cadence-verification",
            "artifact": "projects/tanisea-lyric-film/work/qa/run-2/logs/verify-public.log",
            "sha256": "22cc14785f7493296920c407a3d84d1bfe1091c8553b7485218965fd1aa07820",
            "value": "public cadence verified"
          },
          {
            "id": "criterion-07-evidence-02",
            "kind": "cadence-verification",
            "artifact": "projects/tanisea-lyric-film/work/qa/run-2/logs/verify-proof.log",
            "sha256": "4170d792c559f583ac74e41e89f450e26a01fe19fe43176cf32be117a4b240dc",
            "value": "proof cadence verified"
          }
        ]
      },
      {
        "id": 8,
        "title": "Public chrome and upper-rail removal",
        "status": "proved",
        "evidence": [
          {
            "id": "criterion-08-evidence-01",
            "kind": "public-markup",
            "artifact": "projects/tanisea-lyric-film/work/qa/run-2/logs/verify-public-markup.log",
            "sha256": "479610e7cbdd0daa612376ec6253510c784aa002d523879246f95a0ef748a521",
            "value": "criterion 8 verified"
          },
          {
            "id": "criterion-08-evidence-02",
            "kind": "encoded-frame",
            "artifact": "projects/tanisea-lyric-film/work/qa/run-2/selected-frames/chrome.png",
            "sha256": "7bc33ab82b2ea4eaca2124b79ae6c268b45bd5c27dd8e8fd123361a41712750b",
            "value": "public chrome encoded frame verified"
          }
        ]
      },
      {
        "id": 9,
        "title": "Lyric, spectrum, and safe-area layout",
        "status": "proved",
        "evidence": [
          {
            "id": "criterion-09-evidence-01",
            "kind": "layout-verification",
            "artifact": "projects/tanisea-lyric-film/work/qa/run-2/logs/layout-verify.log",
            "sha256": "82ebc7828329999b62c52cb0c4342455759306963562599508b798dbe6392ae5",
            "value": "criterion 9 verified"
          },
          {
            "id": "criterion-09-evidence-02",
            "kind": "encoded-frame",
            "artifact": "projects/tanisea-lyric-film/work/qa/run-2/selected-frames/safe-area.png",
            "sha256": "ea32e5a02a499b96e0e650e3355ebb92c48ced226420477e6eefad9e7efdf2d4",
            "value": "public safe-area encoded frame verified"
          }
        ]
      },
      {
        "id": 10,
        "title": "Repeated QA with no unexplained drift",
        "status": "proved",
        "evidence": [
          {
            "id": "criterion-10-evidence-01",
            "kind": "qa-run-comparison",
            "artifact": "projects/tanisea-lyric-film/work/qa/run-2/run-comparison.json",
            "sha256": "2c0d5fe5e46d565263caa2d15bee3bc81fc1fa0e738dcae973d9f4c571b754ed",
            "value": "criterion 10 verified"
          }
        ]
      },
      {
        "id": 11,
        "title": "Release assets and documentation readiness",
        "status": "proved",
        "evidence": [
          {
            "id": "criterion-11-evidence-01",
            "kind": "release-url",
            "artifact": "https://github.com/ael-dev3/lyrics/releases/tag/v2.3.0",
            "sha256": "",
            "value": "v2.3.0 release assets and checksums matched after remote download"
          }
        ]
      }
    ]
  },
  "artifactReferences": [
    {
      "id": "source-audio",
      "path": "projects/tanisea-lyric-film/public/soundtrack.m4a",
      "sha256": "93084f293d491da1519732f3fa3cf6416c783d04e8ca18b5569c7608a8d4540d"
    },
    {
      "id": "alignment-manifest",
      "path": "projects/tanisea-lyric-film/alignment/tanisea-word-alignment-v3.json",
      "sha256": "06fe6c8d6ad4db5131ab4f9ab98be91ea87064fdeea58017c6b8c21ed8530f0b"
    },
    {
      "id": "audio-features",
      "path": "projects/tanisea-lyric-film/public/audio-features.bin",
      "sha256": "c9453f8c6fb3de3f16e691b51b4155c5db7e313f5aac1cc7942904754d29b7cf"
    },
    {
      "id": "reference-render",
      "path": "projects/tanisea-lyric-film/output/Tanisea-Lyric-Film-vNext-reference-2x.mov",
      "sha256": "6029f9485afb2c72bee9ec324c5a37be993cce82dbe67c96d0f4fe7e71df6c97"
    },
    {
      "id": "public-master",
      "path": "projects/tanisea-lyric-film/output/Tanisea-Lyric-Film-vNext-60fps-Archival-Master.mp4",
      "sha256": "d00ec94c9649a5bf1ff794b48563535efcd4933147964440467c91e2751888a8"
    },
    {
      "id": "sync-proof",
      "path": "projects/tanisea-lyric-film/output/Tanisea-Lyric-Film-Sync-Proof-120fps.mp4",
      "sha256": "edb93cfe0972ddbb8488b90a252289028f569a93b0f5a577b790625866d423ae"
    },
    {
      "id": "qa-media-manifest",
      "path": "projects/tanisea-lyric-film/work/qa/media/qa-media-manifest.json",
      "sha256": "b31f0c2a5526ed0971bbe2c1dd633e190b972ff4f86d731bb7ce6d519a649b45"
    },
    {
      "id": "v1-03-public-contact",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004224.png",
      "sha256": "fe7b496da3350cd177422e097736c3ddadbb76ae1b2d6c461ac68262b40d7ebf"
    },
    {
      "id": "v1-03-public-contact-sheet",
      "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/v1-03-public.png",
      "sha256": "91eede8b52535d2886e0c0fbd296211c6ca084f90204279cd3c530701d811fa1"
    },
    {
      "id": "v1-03-proof-contact-sheet",
      "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/v1-03-proof.png",
      "sha256": "9a6accfd6af2f473c11ba25069331fa52b88d040216e497b86c1bc7adafee737"
    },
    {
      "id": "v1-08-public-contact-sheet",
      "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/v1-08-public.png",
      "sha256": "3ae1e502867f16507669f6ca33a7bfd160344cb3f44ade76a27f28eaccabb238"
    },
    {
      "id": "v1-08-proof-contact-sheet",
      "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/v1-08-proof.png",
      "sha256": "41ab0b4b9036680e29b1e0c75a31fd432aa60c32d4f3eae4f08059a2db2a6839"
    },
    {
      "id": "public-chrome-still",
      "path": "projects/tanisea-lyric-film/work/qa/media/stills/public-chrome.png",
      "sha256": "7bc33ab82b2ea4eaca2124b79ae6c268b45bd5c27dd8e8fd123361a41712750b"
    },
    {
      "id": "public-handoff-still",
      "path": "projects/tanisea-lyric-film/work/qa/media/stills/public-handoff.png",
      "sha256": "209b0b54574f535ec4bc77ac1123604fbfc7f40ef573eba27ff45b69f4f5b641"
    },
    {
      "id": "public-focus-still",
      "path": "projects/tanisea-lyric-film/work/qa/media/stills/public-focus.png",
      "sha256": "e34bc9a39cf8ed361b00c2848482c2110a2e84a05d08ff3ab52fc5b11afceb4f"
    },
    {
      "id": "public-safe-area-still",
      "path": "projects/tanisea-lyric-film/work/qa/media/stills/public-safe-area.png",
      "sha256": "ea32e5a02a499b96e0e650e3355ebb92c48ced226420477e6eefad9e7efdf2d4"
    },
    {
      "id": "public-spectrum-peak-still",
      "path": "projects/tanisea-lyric-film/work/qa/media/stills/public-spectrum-peak.png",
      "sha256": "d85992dd0f5bc8d88c9774fd1e3ade74c9eb2f4406fb2240d6bc541e3f64d038"
    },
    {
      "id": "proof-backward-contact-still",
      "path": "projects/tanisea-lyric-film/work/qa/media/stills/proof-backward-contact.png",
      "sha256": "6a866826efca3a85edd068b0cc7f7abe2373cf767d84f6504c0cf1726a1ffc12"
    },
    {
      "id": "reference-transition-still",
      "path": "projects/tanisea-lyric-film/work/qa/media/stills/reference-final-transition.png",
      "sha256": "55209e993283bc807d5b3ac7928f6dac667ff1a607bfacc2dafefbe9c45b2b71"
    },
    {
      "id": "qa-media-artifact-001",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/proof/v1-03-half.mp4",
      "sha256": "0f27c5cafa84c8d2be107b3fb7737b631a9113eaf28c993a36a21333bdffad41"
    },
    {
      "id": "qa-media-artifact-002",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/proof/v1-03-normal.mp4",
      "sha256": "2b7681fdc26099c5b4cd14dcae6e858f9a4d5bcea0ab361ab7e6a5dccdeb866e"
    },
    {
      "id": "qa-media-artifact-003",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/proof/v1-08-half.mp4",
      "sha256": "6df69101e205e21f608b1f18ac84b3a74fc157719d12ba947c5b00e98a595d79"
    },
    {
      "id": "qa-media-artifact-004",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/proof/v1-08-normal.mp4",
      "sha256": "84c1bb20a38c284b99393281f2a85fb09877aa1e44a81209e5cc92d8c54d9cdb"
    },
    {
      "id": "qa-media-artifact-005",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/chorus-1-half.mp4",
      "sha256": "9b7e8f9ef22cd6d3ed865e179663e2669277f08ae90901875bcdafa0b9399521"
    },
    {
      "id": "qa-media-artifact-006",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/chorus-1-normal.mp4",
      "sha256": "f5d5fcc23b4255e05c3a65a163bf477165dc1e8f141c449e886af6582c202115"
    },
    {
      "id": "qa-media-artifact-007",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/chorus-2-half.mp4",
      "sha256": "5089d2bbc62c2d3d2dffc63d6355b89e4d03f87f39d833dd324f71fda671c481"
    },
    {
      "id": "qa-media-artifact-008",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/chorus-2-normal.mp4",
      "sha256": "10d8816af80bbc4723e1237d4be2aa4c0a6c8327c31d5839909639b045677550"
    },
    {
      "id": "qa-media-artifact-009",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/final-handoff-half.mp4",
      "sha256": "1ddfe3b6d5eb5bc1c51cb09743fb6f15f36528cd3c2cbefcfb3498d488f63e8c"
    },
    {
      "id": "qa-media-artifact-010",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/final-handoff-normal.mp4",
      "sha256": "7ead21b9efb3903fe6a47024fa0874bc90a9447723c96cafc5e5b80cb3cb9c31"
    },
    {
      "id": "qa-media-artifact-011",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/first-act-40-50-half.mp4",
      "sha256": "0550e33aa2e8eaf7a9c8de9bee685dedb56a4668f09b7853b76c59ad697aa326"
    },
    {
      "id": "qa-media-artifact-012",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/first-act-40-50-normal.mp4",
      "sha256": "713d526fe3ec24f21f199dcbcf0784ffda3889b85b963c59704e779a269d16b4"
    },
    {
      "id": "qa-media-artifact-013",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-01-half.mp4",
      "sha256": "664b5e7c8688f2ea3cc7d78d01c0291101fe4adb6fbbd165e6ab4c3fc79e316e"
    },
    {
      "id": "qa-media-artifact-014",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-01-normal.mp4",
      "sha256": "331799672439c79e69d4e292f475cf2d0719163845340ee10f0bdfa03ef2fb60"
    },
    {
      "id": "qa-media-artifact-015",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-02-half.mp4",
      "sha256": "5a31a328a3551f2cf0ac6427f6ce9c881cbd7a980bc15453f61f341d31e57bf7"
    },
    {
      "id": "qa-media-artifact-016",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-02-normal.mp4",
      "sha256": "0a17dedc1925143cc16301dcd98c92129b609de0afa5bee37af6fbf5d91b5ffc"
    },
    {
      "id": "qa-media-artifact-017",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-03-half.mp4",
      "sha256": "700ac6cf0843513a48abf07253b129643ac653a618b2d8c4a93498946f08466d"
    },
    {
      "id": "qa-media-artifact-018",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-03-normal.mp4",
      "sha256": "4ae518e6577c0ccc66e43ceab9e707bda77a2a80b4ded9247c0a352da0f88c2c"
    },
    {
      "id": "qa-media-artifact-019",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-04-half.mp4",
      "sha256": "30eceb33bd7e21815a6af62d92626738717fdfb8dd5049a8179f0d750763efa8"
    },
    {
      "id": "qa-media-artifact-020",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-04-normal.mp4",
      "sha256": "3023d98adaea8a167e56fa2ce51a17919671140e04af594e6d01830e25c9c7f2"
    },
    {
      "id": "qa-media-artifact-021",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-05-half.mp4",
      "sha256": "9b7e8f9ef22cd6d3ed865e179663e2669277f08ae90901875bcdafa0b9399521"
    },
    {
      "id": "qa-media-artifact-022",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-05-normal.mp4",
      "sha256": "f5d5fcc23b4255e05c3a65a163bf477165dc1e8f141c449e886af6582c202115"
    },
    {
      "id": "qa-media-artifact-023",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-06-half.mp4",
      "sha256": "35912f9f639370259a76f549336d2b3ad0fbed7b3a9c2c89f4dc646b4be2c60f"
    },
    {
      "id": "qa-media-artifact-024",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-06-normal.mp4",
      "sha256": "6ca7bbdc6050ab666b96778724972f4091a767754e2755b7461888d0edc628d7"
    },
    {
      "id": "qa-media-artifact-025",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-07-half.mp4",
      "sha256": "aa548daebad7943360159bf2fff39f54886f19e7a58dc496fe7b5fa3f0273f8c"
    },
    {
      "id": "qa-media-artifact-026",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-07-normal.mp4",
      "sha256": "f2333ea7e0de9bf081021381ceef3c9c0e694555feff38c159dd8e3051238fec"
    },
    {
      "id": "qa-media-artifact-027",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-08-half.mp4",
      "sha256": "7ac316c9f23bfc57f899628c707d8ce22958be73213e2b9093f6362481f671a2"
    },
    {
      "id": "qa-media-artifact-028",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-08-normal.mp4",
      "sha256": "803573bdbd2934a16e666ad95420420846862ac44037dfa4e97cbb07d9fab9fe"
    },
    {
      "id": "qa-media-artifact-029",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-01-half.mp4",
      "sha256": "48255bdf6c3c9dcc2213b4be81881eaf6d947ab8034f92042cc7997aa5e33c56"
    },
    {
      "id": "qa-media-artifact-030",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-01-normal.mp4",
      "sha256": "0384e3547138f02269426c5183f3f3e37917fb27d15dd73db4202db4b3dc1733"
    },
    {
      "id": "qa-media-artifact-031",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-02-half.mp4",
      "sha256": "1b67b7bd321e060a662b573b748ac6375b8f7c8a1a52edfcfe8006f9ad9b74d0"
    },
    {
      "id": "qa-media-artifact-032",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-02-normal.mp4",
      "sha256": "c948482eca290c5e1a4d1fd010c8a2f99bdeadbd15a8e580a9adddfa8fa21b3e"
    },
    {
      "id": "qa-media-artifact-033",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-03-half.mp4",
      "sha256": "96ea9e805b0d0b7b7045f4c1f69132904a64b11a4e73824ee76382557e944aca"
    },
    {
      "id": "qa-media-artifact-034",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-03-normal.mp4",
      "sha256": "c754d6c34539b74adc7033d2d4d8ef45958867d6f3553ac3e9d3dc2e0c7f5ab3"
    },
    {
      "id": "qa-media-artifact-035",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-04-half.mp4",
      "sha256": "194c8fd531eca563c2dd6e3c8718e95bf2ef844a12961f972e76fccd5f250d74"
    },
    {
      "id": "qa-media-artifact-036",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-04-normal.mp4",
      "sha256": "ac713beb3c50ca8a63dfc728f72cd553bb5b878b86b8645f27aefe58e4ad7377"
    },
    {
      "id": "qa-media-artifact-037",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-05-half.mp4",
      "sha256": "5089d2bbc62c2d3d2dffc63d6355b89e4d03f87f39d833dd324f71fda671c481"
    },
    {
      "id": "qa-media-artifact-038",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-05-normal.mp4",
      "sha256": "10d8816af80bbc4723e1237d4be2aa4c0a6c8327c31d5839909639b045677550"
    },
    {
      "id": "qa-media-artifact-039",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-06-half.mp4",
      "sha256": "b60c225afee49988bf120cac88214e20553048a879225adb37cee44a5117120f"
    },
    {
      "id": "qa-media-artifact-040",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-06-normal.mp4",
      "sha256": "97e2e46f1401fa9c393f18679771c77a7e1e0f6c57839b56f43e232c9ccceb2d"
    },
    {
      "id": "qa-media-artifact-041",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-07-half.mp4",
      "sha256": "bcdbf6ed92d0622b38592da0b56f58f0ac84f27917787325150f76568a08ce56"
    },
    {
      "id": "qa-media-artifact-042",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-07-normal.mp4",
      "sha256": "b1190ff147ec8c34706232c1353a518cd099064f13b8d614c82d55185cbe83d8"
    },
    {
      "id": "qa-media-artifact-043",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-08-half.mp4",
      "sha256": "12092083f80207471b7ec39c7bf0855424d693d5f758c4d4a9e71a49b9609088"
    },
    {
      "id": "qa-media-artifact-044",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-08-normal.mp4",
      "sha256": "f1dd74ff31f367440ffb0eb3c11c219583ce177dd2ab907be85f01a0e6e35cf9"
    },
    {
      "id": "qa-media-artifact-045",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-01-half.mp4",
      "sha256": "de6faefa50b6c27d58cbbc6dbfb4b135b93396d2e088f3e67cd60724f0f363ca"
    },
    {
      "id": "qa-media-artifact-046",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-01-normal.mp4",
      "sha256": "e632af83bbd108f6e365e824e0d38e9bd5b9b1aad3347ff8e4365bd449d33b48"
    },
    {
      "id": "qa-media-artifact-047",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-02-half.mp4",
      "sha256": "26fd8f77d4c89c1cd85a198911c880bb342932e3b77ef3e7d4bf90d79a31a839"
    },
    {
      "id": "qa-media-artifact-048",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-02-normal.mp4",
      "sha256": "ea916de057d673819c8ad78b1ca56f1500f326703b85fb9353b0448a533a3abd"
    },
    {
      "id": "qa-media-artifact-049",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-03-half.mp4",
      "sha256": "1e0eca9397ac5766ccd1fe6719d82918bbe4ed847908e72074174c13dedfaa69"
    },
    {
      "id": "qa-media-artifact-050",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-03-normal.mp4",
      "sha256": "e973bfd41f55af38add1d178c5ecc9c9d2ebb14f930b9b7c8212640c7ff02579"
    },
    {
      "id": "qa-media-artifact-051",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-04-half.mp4",
      "sha256": "ddaaaab0fb3c38dc12c4088cca1b991ea828dfa922707404df4909b784183f97"
    },
    {
      "id": "qa-media-artifact-052",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-04-normal.mp4",
      "sha256": "007801d2e6671962c4eabb4f4f03d51bda020cb2cb4ea039731739ff9beab95e"
    },
    {
      "id": "qa-media-artifact-053",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-05-half.mp4",
      "sha256": "1bb552637901e953566cdfd39cf37803368dea40a36272518fdea23901f886a7"
    },
    {
      "id": "qa-media-artifact-054",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-05-normal.mp4",
      "sha256": "08ee8aef76b6334c7ea1f29ecee419f9fba1705638a1142a0d2cdde6f9568252"
    },
    {
      "id": "qa-media-artifact-055",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-06-half.mp4",
      "sha256": "d907a3d67d8fe6a5dce9b7e87399d0029d018291051ce335daaa7d88549fced2"
    },
    {
      "id": "qa-media-artifact-056",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-06-normal.mp4",
      "sha256": "b9d274391e8c0f4effceba2fe3cc18ecb744392e9c8eeacd05ad82774928199c"
    },
    {
      "id": "qa-media-artifact-057",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-07-half.mp4",
      "sha256": "a7db764f2f38582121416c4fce1f06934665dcbd94740de2db8e94aa384ca640"
    },
    {
      "id": "qa-media-artifact-058",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-07-normal.mp4",
      "sha256": "68c86ecf26484be8146226c3a5b6ea693489a4ff2f14e00c0ccb46748e283cca"
    },
    {
      "id": "qa-media-artifact-059",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-08-half.mp4",
      "sha256": "bc72ee4c70e6b8f51268311e979ef9f260e24f8ff7abc0b4b46e7ef521acc322"
    },
    {
      "id": "qa-media-artifact-060",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-08-normal.mp4",
      "sha256": "b0941ee467c19f7094c6ca9fb32537ba13b98390042ff02cb012570046ce2912"
    },
    {
      "id": "qa-media-artifact-061",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/v1-03-half.mp4",
      "sha256": "1e0eca9397ac5766ccd1fe6719d82918bbe4ed847908e72074174c13dedfaa69"
    },
    {
      "id": "qa-media-artifact-062",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/v1-03-normal.mp4",
      "sha256": "e973bfd41f55af38add1d178c5ecc9c9d2ebb14f930b9b7c8212640c7ff02579"
    },
    {
      "id": "qa-media-artifact-063",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/v1-08-half.mp4",
      "sha256": "bc72ee4c70e6b8f51268311e979ef9f260e24f8ff7abc0b4b46e7ef521acc322"
    },
    {
      "id": "qa-media-artifact-064",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/v1-08-normal.mp4",
      "sha256": "b0941ee467c19f7094c6ca9fb32537ba13b98390042ff02cb012570046ce2912"
    },
    {
      "id": "qa-media-artifact-065",
      "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/c1-04-proof.png",
      "sha256": "67f1b4a06339fd86bb2f94d09a57c08a07b2b787741017faa23386c1b1a27ce4"
    },
    {
      "id": "qa-media-artifact-066",
      "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/c1-04-public.png",
      "sha256": "c33dcf0d39339bc2fd61804844f6a12fab69238c84d46cf27ceb4628dbe32636"
    },
    {
      "id": "qa-media-artifact-067",
      "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/c1-06-proof.png",
      "sha256": "997af18a8cb509079875701e6f46d97ef1076b70bb62e4c5d6b4bf5333ddb198"
    },
    {
      "id": "qa-media-artifact-068",
      "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/c1-06-public.png",
      "sha256": "fef844c1bfe608152931582c6a4f84902c67b6b64f66e19eac041af8aa7896e8"
    },
    {
      "id": "qa-media-artifact-069",
      "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/c1-07-proof.png",
      "sha256": "0b7566c2ae83ef6a43cd3bacc9e4a87567144418c2e98431f65feb034faad5d0"
    },
    {
      "id": "qa-media-artifact-070",
      "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/c1-07-public.png",
      "sha256": "13325ca548e8d10d207cf0f51909e5432881a1c525c4c62793331e94a027e10b"
    },
    {
      "id": "qa-media-artifact-071",
      "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/c1-08-proof.png",
      "sha256": "c16e164ae5259820f2d0269b399508f19e9a25ccf7597dc082c305b4443ee74d"
    },
    {
      "id": "qa-media-artifact-072",
      "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/c1-08-public.png",
      "sha256": "7a26cbec4f8053564a529e0ee45d2e3a34bcf9058927ee5774514276f4aff98f"
    },
    {
      "id": "qa-media-artifact-073",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/proof/frame-004057.png",
      "sha256": "778577a2b60200c32b7a773ed12a8d7b86e9e6af54faf36b078aab9f8942c93c"
    },
    {
      "id": "qa-media-artifact-074",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/proof/frame-004058.png",
      "sha256": "d54da9b5b3ef3647c7453a36402a8a2f746df5e6afb7a42cd28d2394c6a03d19"
    },
    {
      "id": "qa-media-artifact-075",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/proof/frame-004059.png",
      "sha256": "fc91268fb9befe81985dd39aff6b22ba788253dc9d56a8ec5c5ff274fb543d28"
    },
    {
      "id": "qa-media-artifact-076",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/proof/frame-004060.png",
      "sha256": "5aa3b2f5552ccc57c4fc0e99d4e6e65605145a40f3e9573092664d054a30a7d8"
    },
    {
      "id": "qa-media-artifact-077",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/proof/frame-004074.png",
      "sha256": "9606a5db96207005d2f452af0f13b2f0e3d6ceb81ebb279146a36dcb20c5638d"
    },
    {
      "id": "qa-media-artifact-078",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/proof/frame-004075.png",
      "sha256": "e539c830fcd039756933ecd51f1d438c5d3d71ea0ee15e1f46385dbdf7fc8a23"
    },
    {
      "id": "qa-media-artifact-079",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/proof/frame-004076.png",
      "sha256": "ae93ae0eda157e6c27c149d0444886b4d3d85a13aeee6ea5b2ea85ff2c88c1f2"
    },
    {
      "id": "qa-media-artifact-080",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/proof/frame-004077.png",
      "sha256": "e37bedb7be25ccf2ed4b9c8e69b00c2a4e1538bd984c6b484a3acc18fc49922b"
    },
    {
      "id": "qa-media-artifact-081",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/proof/frame-004158.png",
      "sha256": "cfab07b6b4904b03543ca3c40b57b04affb23c00c96dd93f2731fb571347e7bc"
    },
    {
      "id": "qa-media-artifact-082",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/proof/frame-004159.png",
      "sha256": "8b63991a00bdca3206322063cdd23139c8af895f8e216ce2d08a7d4cbf29b7ff"
    },
    {
      "id": "qa-media-artifact-083",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/proof/frame-004160.png",
      "sha256": "2d0cbb2d414cde2600e2877d838eb70da03c5fc30033677ff00f2938f688b28c"
    },
    {
      "id": "qa-media-artifact-084",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/proof/frame-004161.png",
      "sha256": "33baa7fd52c2104cbdea2a58816bffa1ce9f1ff465b0f76d18b863107759061a"
    },
    {
      "id": "qa-media-artifact-085",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/public/frame-002028.png",
      "sha256": "f5aaa771f04494c90f32c761d03dd9eb48f77a831b77f49b0664ede843645140"
    },
    {
      "id": "qa-media-artifact-086",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/public/frame-002029.png",
      "sha256": "d6a364f615b24cea789c89dd427f065337d08b1a6badfb3a7aef732eec720dc7"
    },
    {
      "id": "qa-media-artifact-087",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/public/frame-002030.png",
      "sha256": "1bb47da2585855b51533a4494e2cd7159ba98c9e7172603f11fc20177b3479ec"
    },
    {
      "id": "qa-media-artifact-088",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/public/frame-002031.png",
      "sha256": "03572ab0ec191516394573ddb2f5a4e11c5ee400901d632e3730b82b5542bfac"
    },
    {
      "id": "qa-media-artifact-089",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/public/frame-002037.png",
      "sha256": "f962674b149d476e4173683d136eae10573bc2d6c0255cf50540fd88187729fa"
    },
    {
      "id": "qa-media-artifact-090",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/public/frame-002038.png",
      "sha256": "4fb701923636039c13f2929595d45ff93f926e0f0d5881d24ac6d439e64b3b1f"
    },
    {
      "id": "qa-media-artifact-091",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/public/frame-002039.png",
      "sha256": "bbaf14347c93dd47eee7d6c011c52ad990f12a689ca0d2f617cc2084b4b1d257"
    },
    {
      "id": "qa-media-artifact-092",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/public/frame-002040.png",
      "sha256": "7730e671b9413beb05a1dd92b6f90193ad44c0e4e4f65db664ce92afad458a9a"
    },
    {
      "id": "qa-media-artifact-093",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/public/frame-002079.png",
      "sha256": "eb93d02ccdb76ff5f70e7d311ba518256e2ac209d302d6895be159ff0c288f2b"
    },
    {
      "id": "qa-media-artifact-094",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/public/frame-002080.png",
      "sha256": "f5a5e0bf032c4ac2fbd59b6dfaa292dd8ab7f9608ef69b06adae6f651229f7be"
    },
    {
      "id": "qa-media-artifact-095",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/public/frame-002081.png",
      "sha256": "672bc74d3a9316f390038385022c6b42971c5efb09e3dbd2c5600ddfd7689ee0"
    },
    {
      "id": "qa-media-artifact-096",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/public/frame-002082.png",
      "sha256": "0c3cc738b929b47feb85724a0d4d0af0576c16c943508bfe596ed99f68a5be9d"
    },
    {
      "id": "qa-media-artifact-097",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/proof/frame-004889.png",
      "sha256": "4dd70b5264152e29906b0d217a57f567f0bf700b2bebef06ab4edb186aac7c8d"
    },
    {
      "id": "qa-media-artifact-098",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/proof/frame-004890.png",
      "sha256": "8e3e5e12bdb76e028a710b437cacbeda3df91198ef6ca25363c1db2edf32bbb3"
    },
    {
      "id": "qa-media-artifact-099",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/proof/frame-004891.png",
      "sha256": "311b3446752f11d58e530d3e07eaca52471bbdcde2ef83b8252135f01fd1a2bf"
    },
    {
      "id": "qa-media-artifact-100",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/proof/frame-004892.png",
      "sha256": "c31bdad8309064e9bbf3cbf461673293cba58a5aaf2d11d53c322a176ec7e2c3"
    },
    {
      "id": "qa-media-artifact-101",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/proof/frame-004946.png",
      "sha256": "1722dffcec33f42fcb54d3220fb220a833da88a59ac1753d905f0243387e29c6"
    },
    {
      "id": "qa-media-artifact-102",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/proof/frame-004947.png",
      "sha256": "5f6109d939883fb06597091691c50cc8674d7d43ec7ff2ef19e58344f637525c"
    },
    {
      "id": "qa-media-artifact-103",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/proof/frame-004948.png",
      "sha256": "c18dbfbd55ffc8bbca4b73b94ca71dde9a1297a262a41f450a7700b04948157d"
    },
    {
      "id": "qa-media-artifact-104",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/proof/frame-004949.png",
      "sha256": "409e58169eb3ffac1c90f047cb4fe4320ef5f6e9e36c86e83d6362bbcdf89220"
    },
    {
      "id": "qa-media-artifact-105",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/proof/frame-005268.png",
      "sha256": "7e6e09aac40c919a8ae3a37ad2a56a3036931fc56dbbee293bc971351713c3b7"
    },
    {
      "id": "qa-media-artifact-106",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/proof/frame-005269.png",
      "sha256": "508a589626228bbc29930c1af14153be8d70cb889e00d076fb087278e880b6db"
    },
    {
      "id": "qa-media-artifact-107",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/proof/frame-005270.png",
      "sha256": "ca4123805b2d41c93ed7a862e319b2e3c2f83c420c8860c3c687cd086fa8161e"
    },
    {
      "id": "qa-media-artifact-108",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/proof/frame-005271.png",
      "sha256": "005f17d5ed7836bf4d334ceae247a5b3509d39a054a3894817f34e7da618dc64"
    },
    {
      "id": "qa-media-artifact-109",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/public/frame-002444.png",
      "sha256": "1ddbd6c38d6edb4ef041989986f99718b864a4c7d9682eb9056f2e024769167e"
    },
    {
      "id": "qa-media-artifact-110",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/public/frame-002445.png",
      "sha256": "07dcc28eed5b44da7c3125482f98772f2f73fcbee11a702121aca7bb68dbe444"
    },
    {
      "id": "qa-media-artifact-111",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/public/frame-002446.png",
      "sha256": "ce771431654f1ec486b3eacdde7e06669154500b22562c88cbaa307958e1f4e7"
    },
    {
      "id": "qa-media-artifact-112",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/public/frame-002447.png",
      "sha256": "58aee647916ebfdf186f2981022634317f40f321807f681bf6ded5811805ca60"
    },
    {
      "id": "qa-media-artifact-113",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/public/frame-002473.png",
      "sha256": "1413c45e21b9384f3d3e3cfcd8f106904500d1eaf4e13875fb846277373ce1df"
    },
    {
      "id": "qa-media-artifact-114",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/public/frame-002474.png",
      "sha256": "478433d373c9a984b195c2f461cc3e7fd8fecfb7d76a601d476390bd55a90fbc"
    },
    {
      "id": "qa-media-artifact-115",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/public/frame-002475.png",
      "sha256": "713378dc46394ff1fa3e23fd62635bf4b8cec8bafcc97c50f5e06b9475bb9840"
    },
    {
      "id": "qa-media-artifact-116",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/public/frame-002476.png",
      "sha256": "0f675f18818bdfeb2c7b3df175885c3e1fe26848631554369f66625a2f82327d"
    },
    {
      "id": "qa-media-artifact-117",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/public/frame-002634.png",
      "sha256": "d3226b009b4d2f0eddf270b9235b779311517df9e77bbe631a99cf405e5935b7"
    },
    {
      "id": "qa-media-artifact-118",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/public/frame-002635.png",
      "sha256": "635494c888f87427370e3ecfe546562768c89c1e273b39f2f05a37516fe29815"
    },
    {
      "id": "qa-media-artifact-119",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/public/frame-002636.png",
      "sha256": "3944ad7b898c0ccd7e4d5be5a198e881737443af4fefdc37f74e0b503c4afd88"
    },
    {
      "id": "qa-media-artifact-120",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/public/frame-002637.png",
      "sha256": "2b75af4a79a66decfcae97dee1ceade8ea37bb40a2445538c1403cecffc9a5d2"
    },
    {
      "id": "qa-media-artifact-121",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/proof/frame-005372.png",
      "sha256": "10f6e4cc1d9345d97a727b1b1e5595cf8156620cb94931716170e79ba67b3b8b"
    },
    {
      "id": "qa-media-artifact-122",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/proof/frame-005373.png",
      "sha256": "07c3b0a852cddcbed84334db035c15fe359f9b811a72430487c2c5ad8f27a2f5"
    },
    {
      "id": "qa-media-artifact-123",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/proof/frame-005374.png",
      "sha256": "9ae547018ea2bd3008855b05423f7bd481eceb377be2e8b5c2318aabb95760fa"
    },
    {
      "id": "qa-media-artifact-124",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/proof/frame-005375.png",
      "sha256": "bb91209ce9e67b96f7a1863745c8593872eca5492d4559c2528cad6144b1a316"
    },
    {
      "id": "qa-media-artifact-125",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/proof/frame-005477.png",
      "sha256": "34121fbf012126a14218f3fbbc8361febe350fc19586415e5a03aed794d51bc9"
    },
    {
      "id": "qa-media-artifact-126",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/proof/frame-005478.png",
      "sha256": "cc4563ac667af49c85be1dbeb732aedb18ff7b6b64feb69ef4d0ca66b17d4d59"
    },
    {
      "id": "qa-media-artifact-127",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/proof/frame-005479.png",
      "sha256": "1e8c7d0a95b7d7172f8d7b1818e078aaca41f3260cae4fc195b915c354312d1e"
    },
    {
      "id": "qa-media-artifact-128",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/proof/frame-005480.png",
      "sha256": "d081ca079cdccd475e2cd3c1e9d5d1b6e58fd245b2a8f0125d417baf205a2015"
    },
    {
      "id": "qa-media-artifact-129",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/proof/frame-005569.png",
      "sha256": "80b76fe5ed176478d0e31f928d05ff7895546635ce5a5e03213c999f2f532635"
    },
    {
      "id": "qa-media-artifact-130",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/proof/frame-005570.png",
      "sha256": "13391d76bf8c4d3e105660cde9dd17559076e57377316ee5c58eb9728302d2ad"
    },
    {
      "id": "qa-media-artifact-131",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/proof/frame-005571.png",
      "sha256": "5cd54a0895f10b28ad2d2a04a2db15b1ab5e87504c3249e040ad2da786760806"
    },
    {
      "id": "qa-media-artifact-132",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/proof/frame-005572.png",
      "sha256": "1ec7cdc0a84979b05081b1315921b1388072ac30d7fb13c8a75c1a80faa648a0"
    },
    {
      "id": "qa-media-artifact-133",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/public/frame-002685.png",
      "sha256": "5e3e0a3a0c2e3c1040a8d0dda6ac42f5ce5d077d754b17244c5ab4b5c95f3aac"
    },
    {
      "id": "qa-media-artifact-134",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/public/frame-002686.png",
      "sha256": "837973ec5285571bccfdd1f1e0407a6d868e44b58d2081dec2f68a023434c885"
    },
    {
      "id": "qa-media-artifact-135",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/public/frame-002687.png",
      "sha256": "1384e42dd507d58f5a5261f996d680c0717ac39bfb630e1f64325558a80f0ef2"
    },
    {
      "id": "qa-media-artifact-136",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/public/frame-002688.png",
      "sha256": "379458f146795bb916d87f235f175ef32252f6ab42fe24decddb082665142ea2"
    },
    {
      "id": "qa-media-artifact-137",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/public/frame-002738.png",
      "sha256": "e624bc8ea82fcf5e57190084da1b23d48f023829c8fe828494e657c1e13113aa"
    },
    {
      "id": "qa-media-artifact-138",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/public/frame-002739.png",
      "sha256": "8782d2b3809181ffe0b35195eb50faedf3cab58f4ba4632c6f1a2095fe35b58b"
    },
    {
      "id": "qa-media-artifact-139",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/public/frame-002740.png",
      "sha256": "3f0ef22a36ebfeda464e9ea0343cad9b8ad8fc8d138600fa26bfe224e1b77d9e"
    },
    {
      "id": "qa-media-artifact-140",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/public/frame-002741.png",
      "sha256": "3fa4a3f5c4e811cf972c4c711d4b6c0b7611f36198d498e8084b28df3098392c"
    },
    {
      "id": "qa-media-artifact-141",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/public/frame-002784.png",
      "sha256": "93b9f846a4ffd3cf406dc3fce05942a365d430c2def852b57e7a7bd764828004"
    },
    {
      "id": "qa-media-artifact-142",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/public/frame-002785.png",
      "sha256": "331d5c4b4b2f1b573e0bca2edfeaa14afa168589f2b1f24bcce2a69230b284d6"
    },
    {
      "id": "qa-media-artifact-143",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/public/frame-002786.png",
      "sha256": "defdd70e5700e00f17390eea83cd4dff42ff1a83f72517a2ac0b50dc8247494d"
    },
    {
      "id": "qa-media-artifact-144",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/public/frame-002787.png",
      "sha256": "ce554c42d1d45cba53af7b33708ab453a23b0cfca45be25e87873796173c1c27"
    },
    {
      "id": "qa-media-artifact-145",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/proof/frame-005617.png",
      "sha256": "07b5cbc79eb90cc0f5f3dfaccd60721ae497d47540405f98f9be355656b006cc"
    },
    {
      "id": "qa-media-artifact-146",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/proof/frame-005618.png",
      "sha256": "7b3ff2de2d5ea780023b80f41c840a84a53d06a27e6a268d7877b8154f62ac9d"
    },
    {
      "id": "qa-media-artifact-147",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/proof/frame-005619.png",
      "sha256": "63cf9e4761cb82c5211011e0adc15df8b6b1fbb2b7b371dd33b04a58ff670154"
    },
    {
      "id": "qa-media-artifact-148",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/proof/frame-005620.png",
      "sha256": "1a798e1adc70e4493fc7ddec7c2a514111004b5d4ad8b6eab79ea79862084193"
    },
    {
      "id": "qa-media-artifact-149",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/proof/frame-005660.png",
      "sha256": "8c8e7f90fcadbcde6a0711e70f68fa224b1a76415d715b3a99010a16b2811838"
    },
    {
      "id": "qa-media-artifact-150",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/proof/frame-005661.png",
      "sha256": "78f87011c7f282260544ff720d19fd0dda5a6f6b4646260c034ecd3ed295442e"
    },
    {
      "id": "qa-media-artifact-151",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/proof/frame-005662.png",
      "sha256": "79eeecc5544fbead679adc6d9e371077bf7bed10668f4a991f9b80978ad20fe5"
    },
    {
      "id": "qa-media-artifact-152",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/proof/frame-005663.png",
      "sha256": "55f3d439de376a0902a139c11a1534dd4737773bd82396e9b9e1ff7b60c0ed4f"
    },
    {
      "id": "qa-media-artifact-153",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/proof/frame-005708.png",
      "sha256": "dbf7778bbb2d9948b1271b520898fc80320509e1a7269241e5b250a1fb09b0f6"
    },
    {
      "id": "qa-media-artifact-154",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/proof/frame-005709.png",
      "sha256": "5bea5d92a5891c688a58ff32fe3701aaf2352cb83e7cc20dea7b13f0f52d380b"
    },
    {
      "id": "qa-media-artifact-155",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/proof/frame-005710.png",
      "sha256": "a0bdeef278d663cb3a5f4af72a306ecbee5f3b286597401570fd6ea8c76b4a44"
    },
    {
      "id": "qa-media-artifact-156",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/proof/frame-005711.png",
      "sha256": "cc8a21ee717155f847453442826ba4fedd9b9dda5c9ba56037abb6e3dc1e9725"
    },
    {
      "id": "qa-media-artifact-157",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/public/frame-002808.png",
      "sha256": "beae9c27ecbd7bcbcd763b6c6eb128151fd36ac1e341e59f7ae27b3b9e5923a8"
    },
    {
      "id": "qa-media-artifact-158",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/public/frame-002809.png",
      "sha256": "acfc08e02cb634ba708db3ad726802febf40b22a1c3c8f03faeefeccc8a78ba8"
    },
    {
      "id": "qa-media-artifact-159",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/public/frame-002810.png",
      "sha256": "1281a9877c4e164df0f086bcbc26200e5b303a8a2063d25f1a4d7d3d560eef85"
    },
    {
      "id": "qa-media-artifact-160",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/public/frame-002811.png",
      "sha256": "a572fff12344f05433bbde45f8492a6248209fa3be62f324c136df9631458416"
    },
    {
      "id": "qa-media-artifact-161",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/public/frame-002830.png",
      "sha256": "17c1c18ec69ff2a9b60dc60d805ab54ad0363f3d698ff1fc3b89654340437029"
    },
    {
      "id": "qa-media-artifact-162",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/public/frame-002831.png",
      "sha256": "9c4fe8fc56361c9c9fc65fe19d6a92821d337e1585204d8241bd6791f3d43663"
    },
    {
      "id": "qa-media-artifact-163",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/public/frame-002832.png",
      "sha256": "7a6d5c9ac4634458dc232b38cc63927667ccce31dc2212d07068e54c0f7edcb0"
    },
    {
      "id": "qa-media-artifact-164",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/public/frame-002833.png",
      "sha256": "9834b26a470c22589aa1a54b31b9f01264c3865fafbd9c3eb26a4237ea16c3b1"
    },
    {
      "id": "qa-media-artifact-165",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/public/frame-002854.png",
      "sha256": "d08bab167cbac42853f5436afc8aa1123703afc2d49073786dc2f376bf8134ef"
    },
    {
      "id": "qa-media-artifact-166",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/public/frame-002855.png",
      "sha256": "8a66f20a3876ff23d9eadd60577f24da0580c27bdfa65876b25085bb47427fff"
    },
    {
      "id": "qa-media-artifact-167",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/public/frame-002856.png",
      "sha256": "04e0cd827832f83c50f9adfd14130815d860c9fc8e74641f96afafbd412eaaf7"
    },
    {
      "id": "qa-media-artifact-168",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/public/frame-002857.png",
      "sha256": "65cdba125bca00bd8dda05df22576ad2e4681f32507c269af08ebdecdef2e693"
    },
    {
      "id": "qa-media-artifact-169",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008447.png",
      "sha256": "faac5902f146cbbaa5ef6d43db8d25a49733706888a5b1bf0131f56de637acf7"
    },
    {
      "id": "qa-media-artifact-170",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008448.png",
      "sha256": "9c8998a3ab26f9e7dab7ea0b2e4d1b47f1d8dc9cf6a7667437aebb6b21792938"
    },
    {
      "id": "qa-media-artifact-171",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008449.png",
      "sha256": "3e4b992cf7a3d312749495b7cb3ac69c93040ad3a329c5215c018220f8392597"
    },
    {
      "id": "qa-media-artifact-172",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008450.png",
      "sha256": "4aa7c913837a923eaa01d361338934863aae09fd331c16d7cab340183bd965ce"
    },
    {
      "id": "qa-media-artifact-173",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008635.png",
      "sha256": "806234d449449ec7da01f07a635d51498c62431de71790a0c76bee6456aeaffe"
    },
    {
      "id": "qa-media-artifact-174",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008636.png",
      "sha256": "7f59e3145e4a2fa5cc0035d6215007cb722af21c32cfbdd205b2c9e1713261d0"
    },
    {
      "id": "qa-media-artifact-175",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008637.png",
      "sha256": "25958001cca0d381bae1804396599c76eaf708cab452866258e5b3feb4b12880"
    },
    {
      "id": "qa-media-artifact-176",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008638.png",
      "sha256": "5470d340990cd512b4b2675e4a52465136fda742a12c367d587ff868bfd1d703"
    },
    {
      "id": "qa-media-artifact-177",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008709.png",
      "sha256": "c00b93f46a6203eac90c16b40b410859f366d1d861d82cfadb7e20bd46320156"
    },
    {
      "id": "qa-media-artifact-178",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008710.png",
      "sha256": "bcaf3c370f48d85450e6cb52e9e1853441b64e15e5a9574c78973c47fc5ad651"
    },
    {
      "id": "qa-media-artifact-179",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008711.png",
      "sha256": "0bb9ec92de7cdc8f5c4f68df25e4e53fe450626543e7500909c1b6b8f359e9bb"
    },
    {
      "id": "qa-media-artifact-180",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008712.png",
      "sha256": "6342600daf8abd2dc4fdb74955ba2cf6da7802c1e201626d48f1010a13f39a26"
    },
    {
      "id": "qa-media-artifact-181",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004223.png",
      "sha256": "1960819a97b530c6cc490a5b7933399e57ff7049e9c73093ff7a1cc8fc723762"
    },
    {
      "id": "qa-media-artifact-182",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004225.png",
      "sha256": "df5413af4e16ffcb2c754d3ffb8a1ee31bc83cd53314f5aa1e822a04e2718a37"
    },
    {
      "id": "qa-media-artifact-183",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004226.png",
      "sha256": "bbfcccb863eea73b64761b76d8569505f91dbd88ddf5afe9c6c357f51a475d5a"
    },
    {
      "id": "qa-media-artifact-184",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004317.png",
      "sha256": "52041489f870d5d1bb759150da1e6a894cc8bcf61097dc0c55b0c39de235a7bc"
    },
    {
      "id": "qa-media-artifact-185",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004318.png",
      "sha256": "dec5c17f74e15c317309a6991b78aad2206706b85b8772bde55ffc91b19ac5f6"
    },
    {
      "id": "qa-media-artifact-186",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004319.png",
      "sha256": "cb2fc835a4853510c5469d5d422260d5f784f6484592af663965763ed29df6b9"
    },
    {
      "id": "qa-media-artifact-187",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004320.png",
      "sha256": "09e4b2ec932a2cb9fb5a10ad4d2851c448cc1f1c020732e458432a5a1b5492c4"
    },
    {
      "id": "qa-media-artifact-188",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004354.png",
      "sha256": "e294e9b26a52e37779bbbd9faa1342406ace747848c3de23370a91b6b2a59a30"
    },
    {
      "id": "qa-media-artifact-189",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004355.png",
      "sha256": "e34bc9a39cf8ed361b00c2848482c2110a2e84a05d08ff3ab52fc5b11afceb4f"
    },
    {
      "id": "qa-media-artifact-190",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004356.png",
      "sha256": "1b67795c86abba4a678762be5e9656d5f673e5a1f813146b6cfcdc2538675780"
    },
    {
      "id": "qa-media-artifact-191",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004357.png",
      "sha256": "95230a40a3c7cb01490f9a34a1f7e553b479e29ca2b193cdc7e4404136502456"
    },
    {
      "id": "qa-media-artifact-192",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010359.png",
      "sha256": "3ed1d4c1c6959cf17b58583ed0430e37840c3cefe55d3657302a0af8eafa8d80"
    },
    {
      "id": "qa-media-artifact-193",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010360.png",
      "sha256": "8bdeb18bf0ff42eda48dc8e81b99cc844deb87141cb014eddc77506c6d847a5d"
    },
    {
      "id": "qa-media-artifact-194",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010361.png",
      "sha256": "2b4d0bbe98f4da2292bec55781a1cfc27ebe4ba804b4a2f4b6bc87b42427134f"
    },
    {
      "id": "qa-media-artifact-195",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010362.png",
      "sha256": "83116405fcce113afb2dee1050a2ef3f1dc496f94e50e765dc4dba314ccfbffd"
    },
    {
      "id": "qa-media-artifact-196",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010392.png",
      "sha256": "d1477f55c8a16bf496f16aef77c2967c5a60a2c2fe468cb2952e736172853d1a"
    },
    {
      "id": "qa-media-artifact-197",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010393.png",
      "sha256": "e722cf75e41b13ae9ec1c8a1a545d06b6228b4120639370c017c8b989deeb4bb"
    },
    {
      "id": "qa-media-artifact-198",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010394.png",
      "sha256": "6a866826efca3a85edd068b0cc7f7abe2373cf767d84f6504c0cf1726a1ffc12"
    },
    {
      "id": "qa-media-artifact-199",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010395.png",
      "sha256": "5cde8ef37216dd0a9438db556c256577f0fa8d5129aeba11283c86b0efff1ae0"
    },
    {
      "id": "qa-media-artifact-200",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010529.png",
      "sha256": "76d0b5be3109546a316a4bac73690dbd07e3442f404c3145c92b5a1ed284bc65"
    },
    {
      "id": "qa-media-artifact-201",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010530.png",
      "sha256": "dfe5975dff06da9d6971ca52f98319299ee6c327d40c976a5bd1974c270bf708"
    },
    {
      "id": "qa-media-artifact-202",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010531.png",
      "sha256": "c6e684fbb22f515da790751954c00089e6bfd2b96cd6a72db47fe9e59d3e3528"
    },
    {
      "id": "qa-media-artifact-203",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010532.png",
      "sha256": "456fba29b4cc3d23c7efb96bd43b6e40a684ea5f8e41908e3b4e6962cd70661b"
    },
    {
      "id": "qa-media-artifact-204",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010645.png",
      "sha256": "54f3eb245ddd1b1fd2a3aa84a40f98d333084560b8911306bc5faee3a0eb9f0a"
    },
    {
      "id": "qa-media-artifact-205",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010646.png",
      "sha256": "81c25232581e4c2d0a7c6c0e1a6e65935942a4d1cc3977ae7655a7a24694bc4b"
    },
    {
      "id": "qa-media-artifact-206",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010647.png",
      "sha256": "f4b9012144cfb48b125eeae17e056f9eda39a13e6d8269455220d6a7781191b5"
    },
    {
      "id": "qa-media-artifact-207",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010648.png",
      "sha256": "80c74ebaa57966adee0bfc412350addc3f9186dc2811a2b828848ca1b86b9870"
    },
    {
      "id": "qa-media-artifact-208",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005179.png",
      "sha256": "b5703c88b9e9823965e7b91876afefd4206c85dd9901cb7f5a990ea4b26f6c32"
    },
    {
      "id": "qa-media-artifact-209",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005180.png",
      "sha256": "3c76e04de463d891351e197ad5814819bfcdd45b944573541ed693bc32e2db4f"
    },
    {
      "id": "qa-media-artifact-210",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005181.png",
      "sha256": "7c5dbf27c6d25f0bd2d940527ae189dffa2f3d5cafaef8b69060c23a501704b5"
    },
    {
      "id": "qa-media-artifact-211",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005182.png",
      "sha256": "cc7277dcf2f77b240321d8291cf473942a513df365adc4e066ded7dd5765ff6b"
    },
    {
      "id": "qa-media-artifact-212",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005196.png",
      "sha256": "25902b337bb63b509c441dbdf5dc6c696428bd01bcd12216ad4f29e8f5855a39"
    },
    {
      "id": "qa-media-artifact-213",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005197.png",
      "sha256": "b4ee2f1a6c4af5d96d96643778cdbaffd4564a5690404be67d7f937852278b17"
    },
    {
      "id": "qa-media-artifact-214",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005198.png",
      "sha256": "c42814bf39b7ab9c4b1a9efd3a106272696bc30300d17aba8fde45dc5fbe4639"
    },
    {
      "id": "qa-media-artifact-215",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005199.png",
      "sha256": "3ebf1006825a990995f056ac0640d016c6d817505213622f6e6466bd8854dfaf"
    },
    {
      "id": "qa-media-artifact-216",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005264.png",
      "sha256": "d10cdcc5c380ef7835cd04debf0bec7d36ff7db1455e5e1f74bce68f7cc9737c"
    },
    {
      "id": "qa-media-artifact-217",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005265.png",
      "sha256": "91d6294a66c4411636a352d26676eae891f725e54cf00dfcf418efb9415202d8"
    },
    {
      "id": "qa-media-artifact-218",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005266.png",
      "sha256": "5b82463b4504f809cb1d1954d00cda703fa0d31c056da18ec6609a7ca654a26b"
    },
    {
      "id": "qa-media-artifact-219",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005267.png",
      "sha256": "7ad36700f748730ad922ca938f431d0890bca25ba505bf74c73f0140e9fd9ee9"
    },
    {
      "id": "qa-media-artifact-220",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005322.png",
      "sha256": "d2787bab338c7df974df1bbcb4d7cf32a3f54eb3b05805472c47ec5e7b044f7d"
    },
    {
      "id": "qa-media-artifact-221",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005323.png",
      "sha256": "fea4f874ef99879a4055ddcaa1843f24ba33a8c086a3945cfd27099aa17ce737"
    },
    {
      "id": "qa-media-artifact-222",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005324.png",
      "sha256": "93b47baed1388c3f8952ebfbf0265c60fa6f4999bf0ff2b38f0b682f7b804277"
    },
    {
      "id": "qa-media-artifact-223",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005325.png",
      "sha256": "39c2d82b17cb023b80f04fbc0806f35b758856cc4a209795b7bee8c5b331c22d"
    },
    {
      "id": "qa-media-artifact-224",
      "path": "projects/tanisea-lyric-film/work/qa/media/release-sheets/c1-06-proof.png",
      "sha256": "a173b9dcfd116fce368ff90e51da13544104c15bbba60c6fcec5dc4413097d04"
    },
    {
      "id": "qa-media-artifact-225",
      "path": "projects/tanisea-lyric-film/work/qa/media/release-sheets/c1-06-public.png",
      "sha256": "00185e7b9cb879bd6e5d84c64d1b501f68fc14f6da322751ad1d9bba43823588"
    },
    {
      "id": "qa-media-artifact-226",
      "path": "projects/tanisea-lyric-film/work/qa/media/release-sheets/c1-07-proof.png",
      "sha256": "963802ad7d90b82b6d487dd7ff19308c72303bee4ce0de8ed5d80bd4279fb675"
    },
    {
      "id": "qa-media-artifact-227",
      "path": "projects/tanisea-lyric-film/work/qa/media/release-sheets/c1-07-public.png",
      "sha256": "aba668a4ee3de241ee91c8fcad74343939c8caa50426c15d18dfdec190d67488"
    },
    {
      "id": "qa-media-artifact-228",
      "path": "projects/tanisea-lyric-film/work/qa/media/release-sheets/c1-08-proof.png",
      "sha256": "6fe28e234b42ae07254caaae4fc34e5e209702242c6eb7b92112e232cbdd17e8"
    },
    {
      "id": "qa-media-artifact-229",
      "path": "projects/tanisea-lyric-film/work/qa/media/release-sheets/c1-08-public.png",
      "sha256": "179255aa79e20318916b721c8724bd990bd526785745cd4d1c48d39e9c62ca7a"
    },
    {
      "id": "qa-media-artifact-230",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/proof/frame-004937.png",
      "sha256": "5ca1e16d7dc9fa813bc4294e0760678587ce2a69532dab108f14ba5b1754b83f"
    },
    {
      "id": "qa-media-artifact-231",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/proof/frame-004938.png",
      "sha256": "bced5cac448e31a28e7b466f9aaf543a64a89b9a84711cc821d20f06516cf827"
    },
    {
      "id": "qa-media-artifact-232",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/proof/frame-004939.png",
      "sha256": "f4bb334ee1334364ffede69912e2779402ec3b20fa9e6b82c0b04e05e275db74"
    },
    {
      "id": "qa-media-artifact-233",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/proof/frame-004940.png",
      "sha256": "fa61f16dad6b59e7eded04a0890fc93a27e29a5a4474699642a1770b2a9df3f6"
    },
    {
      "id": "qa-media-artifact-234",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/proof/frame-005254.png",
      "sha256": "8e2bb9a9d937c2d602202d141efc4a6c6255fc9f8ea495965f27cc06ec2222fd"
    },
    {
      "id": "qa-media-artifact-235",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/proof/frame-005255.png",
      "sha256": "5268c4d0547f70507edd3623f246ce086390d930d67e765be398ae6f3defc8fb"
    },
    {
      "id": "qa-media-artifact-236",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/proof/frame-005256.png",
      "sha256": "bca4279713290144b4d7d71da491eab54dea61c718661b60c29594611a5a78d5"
    },
    {
      "id": "qa-media-artifact-237",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/proof/frame-005257.png",
      "sha256": "a3a76eec63d64a5642797817ddd81c699f983e67f709aeb6692966e0778702f7"
    },
    {
      "id": "qa-media-artifact-238",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/proof/frame-005365.png",
      "sha256": "52c64f9afd0bbf4d462fb4ad6b83bc76774bdd8f94633fd2c5a81eebfe9215c5"
    },
    {
      "id": "qa-media-artifact-239",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/proof/frame-005366.png",
      "sha256": "f4f939e665c56e11795f2d079e4636b7b9d0264315e3ba700e84a0d399a49d8d"
    },
    {
      "id": "qa-media-artifact-240",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/proof/frame-005367.png",
      "sha256": "2ae422b6a0a391d9543d041b3957c03a08c5167ec44a7dc90a14f59026cccf3f"
    },
    {
      "id": "qa-media-artifact-241",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/proof/frame-005368.png",
      "sha256": "9ae72e342ee0a71c2620d87d590368a519d6252531c0ce73c8bb5cd670640e8a"
    },
    {
      "id": "qa-media-artifact-242",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/public/frame-002468.png",
      "sha256": "9bed75ef0caa103eacb4c59bafd26e42ae6366fe3f6d2a506848b3a28e3a4144"
    },
    {
      "id": "qa-media-artifact-243",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/public/frame-002469.png",
      "sha256": "206b6e95abb4aa4f9ede2488edb9be13c378610f05d9439cea9487a2bcc31590"
    },
    {
      "id": "qa-media-artifact-244",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/public/frame-002470.png",
      "sha256": "f0f982f6041d99beb4648c105f0d0fb193499252adfa5b3c05a4e14308516372"
    },
    {
      "id": "qa-media-artifact-245",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/public/frame-002471.png",
      "sha256": "81a51d9b454357197fa5ab62974309e5de1d6a5e90515b1d88bd2b233c6e6ff8"
    },
    {
      "id": "qa-media-artifact-246",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/public/frame-002627.png",
      "sha256": "869718f1245fe5d3bc7014c7340e42ff00b583ecc4c64bad4e5de1ac905c8db0"
    },
    {
      "id": "qa-media-artifact-247",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/public/frame-002628.png",
      "sha256": "0cbd79fc31c46054b67b2ad63f7cf6ecb4e661143ad214c6cf8a0e6f01425da2"
    },
    {
      "id": "qa-media-artifact-248",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/public/frame-002629.png",
      "sha256": "6a9c11f19ef44f44a3c677fc32b892e99411c9d973c3c9fbae0152ef97868e30"
    },
    {
      "id": "qa-media-artifact-249",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/public/frame-002630.png",
      "sha256": "6f88a0ed87f857cfd9d881727e8dfa710e54a8441ff5440ef21c2eddf5bf4af4"
    },
    {
      "id": "qa-media-artifact-250",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/public/frame-002682.png",
      "sha256": "e02abeda793d25a6a6cc6d9b92b1549c5175486278e617cf1ac7c4bd1c1f74fe"
    },
    {
      "id": "qa-media-artifact-251",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/public/frame-002683.png",
      "sha256": "b6a092008d8c1a4516de5e4804aa46d7eb50d5ab460d957e20a1e8d6402fb0a3"
    },
    {
      "id": "qa-media-artifact-252",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/public/frame-002684.png",
      "sha256": "cc51888a6116c3058017eecf0994081640a3cd32a8b581c5dd0b2c8382f3972f"
    },
    {
      "id": "qa-media-artifact-253",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/public/frame-002685.png",
      "sha256": "5e3e0a3a0c2e3c1040a8d0dda6ac42f5ce5d077d754b17244c5ab4b5c95f3aac"
    },
    {
      "id": "qa-media-artifact-254",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/proof/frame-005475.png",
      "sha256": "d06c3c4c39e17b25359ab96c104eb309945d7680212d8727496cd6edc339aa20"
    },
    {
      "id": "qa-media-artifact-255",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/proof/frame-005476.png",
      "sha256": "c3425a3f5664b34aafd9f52b2bbe1200168fc8310e3bd1fb7b479edae1993696"
    },
    {
      "id": "qa-media-artifact-256",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/proof/frame-005477.png",
      "sha256": "34121fbf012126a14218f3fbbc8361febe350fc19586415e5a03aed794d51bc9"
    },
    {
      "id": "qa-media-artifact-257",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/proof/frame-005478.png",
      "sha256": "cc4563ac667af49c85be1dbeb732aedb18ff7b6b64feb69ef4d0ca66b17d4d59"
    },
    {
      "id": "qa-media-artifact-258",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/proof/frame-005566.png",
      "sha256": "5ddf6bb3e5170113298ab0dff7acb533563d498f72324899527f907f479e29a9"
    },
    {
      "id": "qa-media-artifact-259",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/proof/frame-005567.png",
      "sha256": "48cdeaf3e7de13e0d942c8aea2bf74b8d02eb62cd84f7f348052302d39be2db3"
    },
    {
      "id": "qa-media-artifact-260",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/proof/frame-005568.png",
      "sha256": "5516f3facb2d55756bb2c6ed8307d754fb33266d592ac6152764f0da12e3c9f8"
    },
    {
      "id": "qa-media-artifact-261",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/proof/frame-005569.png",
      "sha256": "80b76fe5ed176478d0e31f928d05ff7895546635ce5a5e03213c999f2f532635"
    },
    {
      "id": "qa-media-artifact-262",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/proof/frame-005614.png",
      "sha256": "a8da04c7cf6efe18cbc7afb852701b2b2c877290b431de4a19b6dedda7b3db4f"
    },
    {
      "id": "qa-media-artifact-263",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/proof/frame-005615.png",
      "sha256": "952358decf9702cfb9ab142e6a529fb5b015751921922d0aa873c2456e1636da"
    },
    {
      "id": "qa-media-artifact-264",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/proof/frame-005616.png",
      "sha256": "6d2383fc32a5f1c5e4b4c2610934f6e8a8fc0b1e047c6956ac571919e037a345"
    },
    {
      "id": "qa-media-artifact-265",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/proof/frame-005617.png",
      "sha256": "07b5cbc79eb90cc0f5f3dfaccd60721ae497d47540405f98f9be355656b006cc"
    },
    {
      "id": "qa-media-artifact-266",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/public/frame-002737.png",
      "sha256": "df847717f156c452293780dc5c571ad4131d0150aa37f7bcd14329dfb154205a"
    },
    {
      "id": "qa-media-artifact-267",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/public/frame-002738.png",
      "sha256": "e624bc8ea82fcf5e57190084da1b23d48f023829c8fe828494e657c1e13113aa"
    },
    {
      "id": "qa-media-artifact-268",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/public/frame-002739.png",
      "sha256": "8782d2b3809181ffe0b35195eb50faedf3cab58f4ba4632c6f1a2095fe35b58b"
    },
    {
      "id": "qa-media-artifact-269",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/public/frame-002740.png",
      "sha256": "3f0ef22a36ebfeda464e9ea0343cad9b8ad8fc8d138600fa26bfe224e1b77d9e"
    },
    {
      "id": "qa-media-artifact-270",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/public/frame-002783.png",
      "sha256": "2b857abbd19b2fc164041d163d4f6f8eb2b1be66325754453ae387d976c23079"
    },
    {
      "id": "qa-media-artifact-271",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/public/frame-002784.png",
      "sha256": "93b9f846a4ffd3cf406dc3fce05942a365d430c2def852b57e7a7bd764828004"
    },
    {
      "id": "qa-media-artifact-272",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/public/frame-002785.png",
      "sha256": "331d5c4b4b2f1b573e0bca2edfeaa14afa168589f2b1f24bcce2a69230b284d6"
    },
    {
      "id": "qa-media-artifact-273",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/public/frame-002786.png",
      "sha256": "defdd70e5700e00f17390eea83cd4dff42ff1a83f72517a2ac0b50dc8247494d"
    },
    {
      "id": "qa-media-artifact-274",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/public/frame-002807.png",
      "sha256": "dad1538057c5bec63669fbfbec2a467fa483a212ca09b6956980107f44c8a37e"
    },
    {
      "id": "qa-media-artifact-275",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/public/frame-002808.png",
      "sha256": "beae9c27ecbd7bcbcd763b6c6eb128151fd36ac1e341e59f7ae27b3b9e5923a8"
    },
    {
      "id": "qa-media-artifact-276",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/public/frame-002809.png",
      "sha256": "acfc08e02cb634ba708db3ad726802febf40b22a1c3c8f03faeefeccc8a78ba8"
    },
    {
      "id": "qa-media-artifact-277",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/public/frame-002810.png",
      "sha256": "1281a9877c4e164df0f086bcbc26200e5b303a8a2063d25f1a4d7d3d560eef85"
    },
    {
      "id": "qa-media-artifact-278",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/proof/frame-005655.png",
      "sha256": "4d81038597539a063e7294b1db929a4fc2d4350d3d12c2121be877e9edfa610d"
    },
    {
      "id": "qa-media-artifact-279",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/proof/frame-005656.png",
      "sha256": "e09dc2b41c57e2b55a21c65d2c6ba7f4ebce1b415ec27c63a28c6bfbb57bbdba"
    },
    {
      "id": "qa-media-artifact-280",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/proof/frame-005657.png",
      "sha256": "8de6b3f85b94bea835f40915cb79c1bbb0c19dd00789f220e199af4f77657382"
    },
    {
      "id": "qa-media-artifact-281",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/proof/frame-005658.png",
      "sha256": "310c8d3555f6e40d12595e443de135adca5f680cd4cdf13df69aea59cd35e95a"
    },
    {
      "id": "qa-media-artifact-282",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/proof/frame-005703.png",
      "sha256": "da360aa157d9911f071daad4e95ac3a61b909aefd407e4e5c274ae55d57a41e6"
    },
    {
      "id": "qa-media-artifact-283",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/proof/frame-005704.png",
      "sha256": "e95a283306762e971a1d7e73f9e59f2c9db8d9481e0792f443e67d47ca4afee8"
    },
    {
      "id": "qa-media-artifact-284",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/proof/frame-005705.png",
      "sha256": "fe35b8525d56610161eaee48caaa9cb8059fecbae1e07c9861b3cea3e64c6c63"
    },
    {
      "id": "qa-media-artifact-285",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/proof/frame-005706.png",
      "sha256": "f0cb6e0be9c362c4c1db26f10555ac79a27ce4edfa5e7179edacdd2ac70f4cd2"
    },
    {
      "id": "qa-media-artifact-286",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/proof/frame-005908.png",
      "sha256": "d6a5eff49ac79590b6f9527f86023575b3fa3fb539ca0de408823d1ace0f39a0"
    },
    {
      "id": "qa-media-artifact-287",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/proof/frame-005909.png",
      "sha256": "cb469c87c0a56a761f14f8e373a3e9545dfefb7938490f8ff95f72219be8aa4b"
    },
    {
      "id": "qa-media-artifact-288",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/proof/frame-005910.png",
      "sha256": "65bcc27948601a6cb8341a6f80b001f158009de8bebdbcc277182d37bc0f0822"
    },
    {
      "id": "qa-media-artifact-289",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/proof/frame-005911.png",
      "sha256": "5d3115285a1fc56726209cb0b3b0ac2d122e446136d5a173f4e0fab36b5d9d28"
    },
    {
      "id": "qa-media-artifact-290",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/public/frame-002827.png",
      "sha256": "114f0d29146273599545cf73af8c5ebaf860610c4e383dc31e721901316cdaa2"
    },
    {
      "id": "qa-media-artifact-291",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/public/frame-002828.png",
      "sha256": "78380c4c2f8bcbc01fe84f282acc7767c158ca857ab015a649952ffe3d9c4914"
    },
    {
      "id": "qa-media-artifact-292",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/public/frame-002829.png",
      "sha256": "12ab71a19ad100d3b5c41eac2bff9b5beb9c888e2be365c0a8db7acbb0b410ec"
    },
    {
      "id": "qa-media-artifact-293",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/public/frame-002830.png",
      "sha256": "17c1c18ec69ff2a9b60dc60d805ab54ad0363f3d698ff1fc3b89654340437029"
    },
    {
      "id": "qa-media-artifact-294",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/public/frame-002851.png",
      "sha256": "fb07ec84b2e4b8afe94f1ad255ab63fa3cd4ddd2c37b70a4b3e52dfcdafb9c4e"
    },
    {
      "id": "qa-media-artifact-295",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/public/frame-002852.png",
      "sha256": "07d62e09853a10cd92b43524b9a0c21c63d1f3535ea7c7d81fb72a7c111cb762"
    },
    {
      "id": "qa-media-artifact-296",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/public/frame-002853.png",
      "sha256": "60a00528991b5631761cf6718f5cde918a7dee5e93804af7df18b24530b18863"
    },
    {
      "id": "qa-media-artifact-297",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/public/frame-002854.png",
      "sha256": "d08bab167cbac42853f5436afc8aa1123703afc2d49073786dc2f376bf8134ef"
    },
    {
      "id": "qa-media-artifact-298",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/public/frame-002953.png",
      "sha256": "c70f4729637622dd0891de58d20aaf4c33d0f6e69baf7280081769c8bef0ab0c"
    },
    {
      "id": "qa-media-artifact-299",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/public/frame-002954.png",
      "sha256": "acfa8957f92041d74aa4cdcfcc3c7719679708fa5811e0ef03bcc2437e76eb6d"
    },
    {
      "id": "qa-media-artifact-300",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/public/frame-002955.png",
      "sha256": "35375d8c74ae10372a897fd372772b053ef8adcae952c808615316fcb82f07d7"
    },
    {
      "id": "qa-media-artifact-301",
      "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/public/frame-002956.png",
      "sha256": "e622e3def45067d919a4e3ec50564bdb92665ba685bcd8b26f1656699ce3ed1b"
    }
  ],
  "baselineRun": {
    "schemaVersion": 1,
    "runId": "run-1",
    "fullMediaExecuted": true,
    "boundedClaim": "sample-indexed alignment with frame-bounded rendering",
    "git": {
      "headCommit": "5b0eef186e8e2ed5da2bfa0d88a5dd6625123a93",
      "trackedTreeSha256": "a56a23db5fa36bfb03fe5ec1d802507f46dd2a2b0aeb91a135a1d6a3dfd906d3",
      "worktreeDiffSha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "isClean": true,
      "statusEntries": []
    },
    "toolVersions": {
      "node": "v24.19.0",
      "npm": "11.7.0",
      "ffmpeg": "ffmpeg version 9.0-full_build-www.gyan.dev Copyright (c) 2000-2026 the FFmpeg developers",
      "ffprobe": "ffprobe version 9.0-full_build-www.gyan.dev Copyright (c) 2007-2026 the FFmpeg developers"
    },
    "commands": [
      {
        "id": "npm-ci",
        "command": "npm ci",
        "exitCode": 0,
        "durationMs": 48044.035800000005,
        "logPath": "projects/tanisea-lyric-film/work/qa/run-1/logs/npm-ci.log",
        "logSha256": "f1aee413ad4ae096e78d64e0ac25105dea6510b0b2cb614f20d9507984cddc6d"
      },
      {
        "id": "check",
        "command": "npm run check",
        "exitCode": 0,
        "durationMs": 64009.59099999999,
        "logPath": "projects/tanisea-lyric-film/work/qa/run-1/logs/check.log",
        "logSha256": "cdb4b47d4e5731fac4b5b99d7a3e9e38abcb1f4761cf3ede735d13965cc210f8"
      },
      {
        "id": "alignment-verify",
        "command": "npm run alignment:verify",
        "exitCode": 0,
        "durationMs": 1040.366599999994,
        "logPath": "projects/tanisea-lyric-film/work/qa/run-1/logs/alignment-verify.log",
        "logSha256": "2da516f864b017f6a3d5549181cedfead778c2e520ff5fa7fbff5c5b2c5938e2"
      },
      {
        "id": "layout-verify",
        "command": "npm run layout:verify",
        "exitCode": 0,
        "durationMs": 9119.039999999994,
        "logPath": "projects/tanisea-lyric-film/work/qa/run-1/logs/layout-verify.log",
        "logSha256": "7fd3213602cdd001189d057991d9037d59e41e68b8c4c27c96c8410bbba45ca3"
      },
      {
        "id": "compositions",
        "command": "npm run compositions",
        "exitCode": 0,
        "durationMs": 3953.933600000004,
        "logPath": "projects/tanisea-lyric-film/work/qa/run-1/logs/compositions.log",
        "logSha256": "00d71653a3ad4771783dbb8478b066a463b93ff7421ead2a32009aa1870b777e"
      },
      {
        "id": "verify-reference",
        "command": "npm run verify -- --kind reference",
        "exitCode": 0,
        "durationMs": 732390.4829000001,
        "logPath": "projects/tanisea-lyric-film/work/qa/run-1/logs/verify-reference.log",
        "logSha256": "5447f0279cde9d5b53b07fb6058166f8a6f161865b0b073ad9236efe86cb0b70"
      },
      {
        "id": "verify-public",
        "command": "npm run verify -- --kind public",
        "exitCode": 0,
        "durationMs": 22789.351000000024,
        "logPath": "projects/tanisea-lyric-film/work/qa/run-1/logs/verify-public.log",
        "logSha256": "7d7d0311da35467f94c62bbfe6c8d70e546df2a00d1b209b4a8d326f1ce9b964"
      },
      {
        "id": "verify-proof",
        "command": "npm run verify -- --kind proof",
        "exitCode": 0,
        "durationMs": 33254.173100000015,
        "logPath": "projects/tanisea-lyric-film/work/qa/run-1/logs/verify-proof.log",
        "logSha256": "89493fe1f61f0f5449729f6e8428154fa86e0a3e9a5d6dd742f1f5f79dd526ec"
      },
      {
        "id": "verify-public-markup",
        "command": "npm run test:run -- tests/release-gates.test.ts -t \"public-markup release gate\"",
        "exitCode": 0,
        "durationMs": 1090.030999999959,
        "logPath": "projects/tanisea-lyric-film/work/qa/run-1/logs/verify-public-markup.log",
        "logSha256": "13484bd0fab0faf61e86fa5d6179ef1ef258a99d4b6730c1a6698d6f29a768d1"
      },
      {
        "id": "verify-matrix",
        "command": "npm run test:run -- tests/release-gates.test.ts -t \"requirement-matrix release gate\"",
        "exitCode": 0,
        "durationMs": 1086.6367000000319,
        "logPath": "projects/tanisea-lyric-film/work/qa/run-1/logs/verify-matrix.log",
        "logSha256": "7666b8de934b2588ed9fe1e75bd787e2e93519ee82f460e11e6292b48646552a"
      }
    ],
    "artifacts": [
      {
        "id": "source-audio",
        "kind": "source-audio",
        "path": "projects/tanisea-lyric-film/public/soundtrack.m4a",
        "sizeBytes": 2476341,
        "sha256": "93084f293d491da1519732f3fa3cf6416c783d04e8ca18b5569c7608a8d4540d"
      },
      {
        "id": "alignment-manifest",
        "kind": "alignment",
        "path": "projects/tanisea-lyric-film/alignment/tanisea-word-alignment-v3.json",
        "sizeBytes": 351148,
        "sha256": "06fe6c8d6ad4db5131ab4f9ab98be91ea87064fdeea58017c6b8c21ed8530f0b"
      },
      {
        "id": "audio-features",
        "kind": "features",
        "path": "projects/tanisea-lyric-film/public/audio-features.bin",
        "sizeBytes": 688532,
        "sha256": "c9453f8c6fb3de3f16e691b51b4155c5db7e313f5aac1cc7942904754d29b7cf"
      },
      {
        "id": "reference-render",
        "kind": "reference",
        "path": "projects/tanisea-lyric-film/output/Tanisea-Lyric-Film-vNext-reference-2x.mov",
        "sizeBytes": 28709540792,
        "sha256": "6029f9485afb2c72bee9ec324c5a37be993cce82dbe67c96d0f4fe7e71df6c97"
      },
      {
        "id": "public-master",
        "kind": "public",
        "path": "projects/tanisea-lyric-film/output/Tanisea-Lyric-Film-vNext-60fps-Archival-Master.mp4",
        "sizeBytes": 19499812,
        "sha256": "d00ec94c9649a5bf1ff794b48563535efcd4933147964440467c91e2751888a8"
      },
      {
        "id": "sync-proof",
        "kind": "proof",
        "path": "projects/tanisea-lyric-film/output/Tanisea-Lyric-Film-Sync-Proof-120fps.mp4",
        "sizeBytes": 158033925,
        "sha256": "edb93cfe0972ddbb8488b90a252289028f569a93b0f5a577b790625866d423ae"
      },
      {
        "id": "qa-media-manifest",
        "kind": "qa-manifest",
        "path": "projects/tanisea-lyric-film/work/qa/media/qa-media-manifest.json",
        "sizeBytes": 55571,
        "sha256": "b31f0c2a5526ed0971bbe2c1dd633e190b972ff4f86d731bb7ce6d519a649b45"
      },
      {
        "id": "v1-03-public-contact",
        "kind": "qa-contact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004224.png",
        "sizeBytes": 3462865,
        "sha256": "fe7b496da3350cd177422e097736c3ddadbb76ae1b2d6c461ac68262b40d7ebf"
      },
      {
        "id": "v1-03-public-contact-sheet",
        "kind": "qa-contact-sheet",
        "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/v1-03-public.png",
        "sizeBytes": 1764409,
        "sha256": "91eede8b52535d2886e0c0fbd296211c6ca084f90204279cd3c530701d811fa1"
      },
      {
        "id": "v1-03-proof-contact-sheet",
        "kind": "qa-contact-sheet",
        "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/v1-03-proof.png",
        "sizeBytes": 1979298,
        "sha256": "9a6accfd6af2f473c11ba25069331fa52b88d040216e497b86c1bc7adafee737"
      },
      {
        "id": "v1-08-public-contact-sheet",
        "kind": "qa-contact-sheet",
        "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/v1-08-public.png",
        "sizeBytes": 1811133,
        "sha256": "3ae1e502867f16507669f6ca33a7bfd160344cb3f44ade76a27f28eaccabb238"
      },
      {
        "id": "v1-08-proof-contact-sheet",
        "kind": "qa-contact-sheet",
        "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/v1-08-proof.png",
        "sizeBytes": 2616114,
        "sha256": "41ab0b4b9036680e29b1e0c75a31fd432aa60c32d4f3eae4f08059a2db2a6839"
      },
      {
        "id": "public-chrome-still",
        "kind": "qa-still",
        "path": "projects/tanisea-lyric-film/work/qa/media/stills/public-chrome.png",
        "sizeBytes": 3340059,
        "sha256": "7bc33ab82b2ea4eaca2124b79ae6c268b45bd5c27dd8e8fd123361a41712750b"
      },
      {
        "id": "public-handoff-still",
        "kind": "qa-still",
        "path": "projects/tanisea-lyric-film/work/qa/media/stills/public-handoff.png",
        "sizeBytes": 3219048,
        "sha256": "209b0b54574f535ec4bc77ac1123604fbfc7f40ef573eba27ff45b69f4f5b641"
      },
      {
        "id": "public-focus-still",
        "kind": "qa-still",
        "path": "projects/tanisea-lyric-film/work/qa/media/stills/public-focus.png",
        "sizeBytes": 3073586,
        "sha256": "e34bc9a39cf8ed361b00c2848482c2110a2e84a05d08ff3ab52fc5b11afceb4f"
      },
      {
        "id": "public-safe-area-still",
        "kind": "qa-still",
        "path": "projects/tanisea-lyric-film/work/qa/media/stills/public-safe-area.png",
        "sizeBytes": 3276104,
        "sha256": "ea32e5a02a499b96e0e650e3355ebb92c48ced226420477e6eefad9e7efdf2d4"
      },
      {
        "id": "public-spectrum-peak-still",
        "kind": "qa-still",
        "path": "projects/tanisea-lyric-film/work/qa/media/stills/public-spectrum-peak.png",
        "sizeBytes": 3436615,
        "sha256": "d85992dd0f5bc8d88c9774fd1e3ade74c9eb2f4406fb2240d6bc541e3f64d038"
      },
      {
        "id": "proof-backward-contact-still",
        "kind": "qa-still",
        "path": "projects/tanisea-lyric-film/work/qa/media/stills/proof-backward-contact.png",
        "sizeBytes": 872583,
        "sha256": "6a866826efca3a85edd068b0cc7f7abe2373cf767d84f6504c0cf1726a1ffc12"
      },
      {
        "id": "reference-transition-still",
        "kind": "qa-still",
        "path": "projects/tanisea-lyric-film/work/qa/media/stills/reference-final-transition.png",
        "sizeBytes": 20747170,
        "sha256": "55209e993283bc807d5b3ac7928f6dac667ff1a607bfacc2dafefbe9c45b2b71"
      },
      {
        "id": "qa-media-artifact-001",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/proof/v1-03-half.mp4",
        "sizeBytes": 1435309,
        "sha256": "0f27c5cafa84c8d2be107b3fb7737b631a9113eaf28c993a36a21333bdffad41"
      },
      {
        "id": "qa-media-artifact-002",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/proof/v1-03-normal.mp4",
        "sizeBytes": 1124864,
        "sha256": "2b7681fdc26099c5b4cd14dcae6e858f9a4d5bcea0ab361ab7e6a5dccdeb866e"
      },
      {
        "id": "qa-media-artifact-003",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/proof/v1-08-half.mp4",
        "sizeBytes": 1526866,
        "sha256": "6df69101e205e21f608b1f18ac84b3a74fc157719d12ba947c5b00e98a595d79"
      },
      {
        "id": "qa-media-artifact-004",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/proof/v1-08-normal.mp4",
        "sizeBytes": 1189797,
        "sha256": "84c1bb20a38c284b99393281f2a85fb09877aa1e44a81209e5cc92d8c54d9cdb"
      },
      {
        "id": "qa-media-artifact-005",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/chorus-1-half.mp4",
        "sizeBytes": 678968,
        "sha256": "9b7e8f9ef22cd6d3ed865e179663e2669277f08ae90901875bcdafa0b9399521"
      },
      {
        "id": "qa-media-artifact-006",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/chorus-1-normal.mp4",
        "sizeBytes": 488632,
        "sha256": "f5d5fcc23b4255e05c3a65a163bf477165dc1e8f141c449e886af6582c202115"
      },
      {
        "id": "qa-media-artifact-007",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/chorus-2-half.mp4",
        "sizeBytes": 722890,
        "sha256": "5089d2bbc62c2d3d2dffc63d6355b89e4d03f87f39d833dd324f71fda671c481"
      },
      {
        "id": "qa-media-artifact-008",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/chorus-2-normal.mp4",
        "sizeBytes": 521060,
        "sha256": "10d8816af80bbc4723e1237d4be2aa4c0a6c8327c31d5839909639b045677550"
      },
      {
        "id": "qa-media-artifact-009",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/final-handoff-half.mp4",
        "sizeBytes": 603882,
        "sha256": "1ddfe3b6d5eb5bc1c51cb09743fb6f15f36528cd3c2cbefcfb3498d488f63e8c"
      },
      {
        "id": "qa-media-artifact-010",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/final-handoff-normal.mp4",
        "sizeBytes": 430144,
        "sha256": "7ead21b9efb3903fe6a47024fa0874bc90a9447723c96cafc5e5b80cb3cb9c31"
      },
      {
        "id": "qa-media-artifact-011",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/first-act-40-50-half.mp4",
        "sizeBytes": 2984133,
        "sha256": "0550e33aa2e8eaf7a9c8de9bee685dedb56a4668f09b7853b76c59ad697aa326"
      },
      {
        "id": "qa-media-artifact-012",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/first-act-40-50-normal.mp4",
        "sizeBytes": 2054324,
        "sha256": "713d526fe3ec24f21f199dcbcf0784ffda3889b85b963c59704e779a269d16b4"
      },
      {
        "id": "qa-media-artifact-013",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-01-half.mp4",
        "sizeBytes": 628400,
        "sha256": "664b5e7c8688f2ea3cc7d78d01c0291101fe4adb6fbbd165e6ab4c3fc79e316e"
      },
      {
        "id": "qa-media-artifact-014",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-01-normal.mp4",
        "sizeBytes": 448343,
        "sha256": "331799672439c79e69d4e292f475cf2d0719163845340ee10f0bdfa03ef2fb60"
      },
      {
        "id": "qa-media-artifact-015",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-02-half.mp4",
        "sizeBytes": 579237,
        "sha256": "5a31a328a3551f2cf0ac6427f6ce9c881cbd7a980bc15453f61f341d31e57bf7"
      },
      {
        "id": "qa-media-artifact-016",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-02-normal.mp4",
        "sizeBytes": 416156,
        "sha256": "0a17dedc1925143cc16301dcd98c92129b609de0afa5bee37af6fbf5d91b5ffc"
      },
      {
        "id": "qa-media-artifact-017",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-03-half.mp4",
        "sizeBytes": 501297,
        "sha256": "700ac6cf0843513a48abf07253b129643ac653a618b2d8c4a93498946f08466d"
      },
      {
        "id": "qa-media-artifact-018",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-03-normal.mp4",
        "sizeBytes": 357208,
        "sha256": "4ae518e6577c0ccc66e43ceab9e707bda77a2a80b4ded9247c0a352da0f88c2c"
      },
      {
        "id": "qa-media-artifact-019",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-04-half.mp4",
        "sizeBytes": 596123,
        "sha256": "30eceb33bd7e21815a6af62d92626738717fdfb8dd5049a8179f0d750763efa8"
      },
      {
        "id": "qa-media-artifact-020",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-04-normal.mp4",
        "sizeBytes": 421571,
        "sha256": "3023d98adaea8a167e56fa2ce51a17919671140e04af594e6d01830e25c9c7f2"
      },
      {
        "id": "qa-media-artifact-021",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-05-half.mp4",
        "sizeBytes": 678968,
        "sha256": "9b7e8f9ef22cd6d3ed865e179663e2669277f08ae90901875bcdafa0b9399521"
      },
      {
        "id": "qa-media-artifact-022",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-05-normal.mp4",
        "sizeBytes": 488632,
        "sha256": "f5d5fcc23b4255e05c3a65a163bf477165dc1e8f141c449e886af6582c202115"
      },
      {
        "id": "qa-media-artifact-023",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-06-half.mp4",
        "sizeBytes": 593569,
        "sha256": "35912f9f639370259a76f549336d2b3ad0fbed7b3a9c2c89f4dc646b4be2c60f"
      },
      {
        "id": "qa-media-artifact-024",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-06-normal.mp4",
        "sizeBytes": 421680,
        "sha256": "6ca7bbdc6050ab666b96778724972f4091a767754e2755b7461888d0edc628d7"
      },
      {
        "id": "qa-media-artifact-025",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-07-half.mp4",
        "sizeBytes": 571268,
        "sha256": "aa548daebad7943360159bf2fff39f54886f19e7a58dc496fe7b5fa3f0273f8c"
      },
      {
        "id": "qa-media-artifact-026",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-07-normal.mp4",
        "sizeBytes": 407926,
        "sha256": "f2333ea7e0de9bf081021381ceef3c9c0e694555feff38c159dd8e3051238fec"
      },
      {
        "id": "qa-media-artifact-027",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-08-half.mp4",
        "sizeBytes": 552837,
        "sha256": "7ac316c9f23bfc57f899628c707d8ce22958be73213e2b9093f6362481f671a2"
      },
      {
        "id": "qa-media-artifact-028",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-08-normal.mp4",
        "sizeBytes": 392522,
        "sha256": "803573bdbd2934a16e666ad95420420846862ac44037dfa4e97cbb07d9fab9fe"
      },
      {
        "id": "qa-media-artifact-029",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-01-half.mp4",
        "sizeBytes": 594699,
        "sha256": "48255bdf6c3c9dcc2213b4be81881eaf6d947ab8034f92042cc7997aa5e33c56"
      },
      {
        "id": "qa-media-artifact-030",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-01-normal.mp4",
        "sizeBytes": 421286,
        "sha256": "0384e3547138f02269426c5183f3f3e37917fb27d15dd73db4202db4b3dc1733"
      },
      {
        "id": "qa-media-artifact-031",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-02-half.mp4",
        "sizeBytes": 664604,
        "sha256": "1b67b7bd321e060a662b573b748ac6375b8f7c8a1a52edfcfe8006f9ad9b74d0"
      },
      {
        "id": "qa-media-artifact-032",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-02-normal.mp4",
        "sizeBytes": 481221,
        "sha256": "c948482eca290c5e1a4d1fd010c8a2f99bdeadbd15a8e580a9adddfa8fa21b3e"
      },
      {
        "id": "qa-media-artifact-033",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-03-half.mp4",
        "sizeBytes": 536744,
        "sha256": "96ea9e805b0d0b7b7045f4c1f69132904a64b11a4e73824ee76382557e944aca"
      },
      {
        "id": "qa-media-artifact-034",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-03-normal.mp4",
        "sizeBytes": 382597,
        "sha256": "c754d6c34539b74adc7033d2d4d8ef45958867d6f3553ac3e9d3dc2e0c7f5ab3"
      },
      {
        "id": "qa-media-artifact-035",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-04-half.mp4",
        "sizeBytes": 623753,
        "sha256": "194c8fd531eca563c2dd6e3c8718e95bf2ef844a12961f972e76fccd5f250d74"
      },
      {
        "id": "qa-media-artifact-036",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-04-normal.mp4",
        "sizeBytes": 439229,
        "sha256": "ac713beb3c50ca8a63dfc728f72cd553bb5b878b86b8645f27aefe58e4ad7377"
      },
      {
        "id": "qa-media-artifact-037",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-05-half.mp4",
        "sizeBytes": 722890,
        "sha256": "5089d2bbc62c2d3d2dffc63d6355b89e4d03f87f39d833dd324f71fda671c481"
      },
      {
        "id": "qa-media-artifact-038",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-05-normal.mp4",
        "sizeBytes": 521060,
        "sha256": "10d8816af80bbc4723e1237d4be2aa4c0a6c8327c31d5839909639b045677550"
      },
      {
        "id": "qa-media-artifact-039",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-06-half.mp4",
        "sizeBytes": 696722,
        "sha256": "b60c225afee49988bf120cac88214e20553048a879225adb37cee44a5117120f"
      },
      {
        "id": "qa-media-artifact-040",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-06-normal.mp4",
        "sizeBytes": 493733,
        "sha256": "97e2e46f1401fa9c393f18679771c77a7e1e0f6c57839b56f43e232c9ccceb2d"
      },
      {
        "id": "qa-media-artifact-041",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-07-half.mp4",
        "sizeBytes": 583689,
        "sha256": "bcdbf6ed92d0622b38592da0b56f58f0ac84f27917787325150f76568a08ce56"
      },
      {
        "id": "qa-media-artifact-042",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-07-normal.mp4",
        "sizeBytes": 418776,
        "sha256": "b1190ff147ec8c34706232c1353a518cd099064f13b8d614c82d55185cbe83d8"
      },
      {
        "id": "qa-media-artifact-043",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-08-half.mp4",
        "sizeBytes": 595914,
        "sha256": "12092083f80207471b7ec39c7bf0855424d693d5f758c4d4a9e71a49b9609088"
      },
      {
        "id": "qa-media-artifact-044",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-08-normal.mp4",
        "sizeBytes": 423949,
        "sha256": "f1dd74ff31f367440ffb0eb3c11c219583ce177dd2ab907be85f01a0e6e35cf9"
      },
      {
        "id": "qa-media-artifact-045",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-01-half.mp4",
        "sizeBytes": 724809,
        "sha256": "de6faefa50b6c27d58cbbc6dbfb4b135b93396d2e088f3e67cd60724f0f363ca"
      },
      {
        "id": "qa-media-artifact-046",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-01-normal.mp4",
        "sizeBytes": 523887,
        "sha256": "e632af83bbd108f6e365e824e0d38e9bd5b9b1aad3347ff8e4365bd449d33b48"
      },
      {
        "id": "qa-media-artifact-047",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-02-half.mp4",
        "sizeBytes": 622318,
        "sha256": "26fd8f77d4c89c1cd85a198911c880bb342932e3b77ef3e7d4bf90d79a31a839"
      },
      {
        "id": "qa-media-artifact-048",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-02-normal.mp4",
        "sizeBytes": 440803,
        "sha256": "ea916de057d673819c8ad78b1ca56f1500f326703b85fb9353b0448a533a3abd"
      },
      {
        "id": "qa-media-artifact-049",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-03-half.mp4",
        "sizeBytes": 653442,
        "sha256": "1e0eca9397ac5766ccd1fe6719d82918bbe4ed847908e72074174c13dedfaa69"
      },
      {
        "id": "qa-media-artifact-050",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-03-normal.mp4",
        "sizeBytes": 461607,
        "sha256": "e973bfd41f55af38add1d178c5ecc9c9d2ebb14f930b9b7c8212640c7ff02579"
      },
      {
        "id": "qa-media-artifact-051",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-04-half.mp4",
        "sizeBytes": 658084,
        "sha256": "ddaaaab0fb3c38dc12c4088cca1b991ea828dfa922707404df4909b784183f97"
      },
      {
        "id": "qa-media-artifact-052",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-04-normal.mp4",
        "sizeBytes": 480982,
        "sha256": "007801d2e6671962c4eabb4f4f03d51bda020cb2cb4ea039731739ff9beab95e"
      },
      {
        "id": "qa-media-artifact-053",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-05-half.mp4",
        "sizeBytes": 669043,
        "sha256": "1bb552637901e953566cdfd39cf37803368dea40a36272518fdea23901f886a7"
      },
      {
        "id": "qa-media-artifact-054",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-05-normal.mp4",
        "sizeBytes": 478171,
        "sha256": "08ee8aef76b6334c7ea1f29ecee419f9fba1705638a1142a0d2cdde6f9568252"
      },
      {
        "id": "qa-media-artifact-055",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-06-half.mp4",
        "sizeBytes": 670728,
        "sha256": "d907a3d67d8fe6a5dce9b7e87399d0029d018291051ce335daaa7d88549fced2"
      },
      {
        "id": "qa-media-artifact-056",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-06-normal.mp4",
        "sizeBytes": 480654,
        "sha256": "b9d274391e8c0f4effceba2fe3cc18ecb744392e9c8eeacd05ad82774928199c"
      },
      {
        "id": "qa-media-artifact-057",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-07-half.mp4",
        "sizeBytes": 639749,
        "sha256": "a7db764f2f38582121416c4fce1f06934665dcbd94740de2db8e94aa384ca640"
      },
      {
        "id": "qa-media-artifact-058",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-07-normal.mp4",
        "sizeBytes": 458570,
        "sha256": "68c86ecf26484be8146226c3a5b6ea693489a4ff2f14e00c0ccb46748e283cca"
      },
      {
        "id": "qa-media-artifact-059",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-08-half.mp4",
        "sizeBytes": 657031,
        "sha256": "bc72ee4c70e6b8f51268311e979ef9f260e24f8ff7abc0b4b46e7ef521acc322"
      },
      {
        "id": "qa-media-artifact-060",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-08-normal.mp4",
        "sizeBytes": 479229,
        "sha256": "b0941ee467c19f7094c6ca9fb32537ba13b98390042ff02cb012570046ce2912"
      },
      {
        "id": "qa-media-artifact-061",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/v1-03-half.mp4",
        "sizeBytes": 653442,
        "sha256": "1e0eca9397ac5766ccd1fe6719d82918bbe4ed847908e72074174c13dedfaa69"
      },
      {
        "id": "qa-media-artifact-062",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/v1-03-normal.mp4",
        "sizeBytes": 461607,
        "sha256": "e973bfd41f55af38add1d178c5ecc9c9d2ebb14f930b9b7c8212640c7ff02579"
      },
      {
        "id": "qa-media-artifact-063",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/v1-08-half.mp4",
        "sizeBytes": 657031,
        "sha256": "bc72ee4c70e6b8f51268311e979ef9f260e24f8ff7abc0b4b46e7ef521acc322"
      },
      {
        "id": "qa-media-artifact-064",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/v1-08-normal.mp4",
        "sizeBytes": 479229,
        "sha256": "b0941ee467c19f7094c6ca9fb32537ba13b98390042ff02cb012570046ce2912"
      },
      {
        "id": "qa-media-artifact-065",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/c1-04-proof.png",
        "sizeBytes": 2032340,
        "sha256": "67f1b4a06339fd86bb2f94d09a57c08a07b2b787741017faa23386c1b1a27ce4"
      },
      {
        "id": "qa-media-artifact-066",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/c1-04-public.png",
        "sizeBytes": 1547256,
        "sha256": "c33dcf0d39339bc2fd61804844f6a12fab69238c84d46cf27ceb4628dbe32636"
      },
      {
        "id": "qa-media-artifact-067",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/c1-06-proof.png",
        "sizeBytes": 2063233,
        "sha256": "997af18a8cb509079875701e6f46d97ef1076b70bb62e4c5d6b4bf5333ddb198"
      },
      {
        "id": "qa-media-artifact-068",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/c1-06-public.png",
        "sizeBytes": 1599149,
        "sha256": "fef844c1bfe608152931582c6a4f84902c67b6b64f66e19eac041af8aa7896e8"
      },
      {
        "id": "qa-media-artifact-069",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/c1-07-proof.png",
        "sizeBytes": 2034517,
        "sha256": "0b7566c2ae83ef6a43cd3bacc9e4a87567144418c2e98431f65feb034faad5d0"
      },
      {
        "id": "qa-media-artifact-070",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/c1-07-public.png",
        "sizeBytes": 1690351,
        "sha256": "13325ca548e8d10d207cf0f51909e5432881a1c525c4c62793331e94a027e10b"
      },
      {
        "id": "qa-media-artifact-071",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/c1-08-proof.png",
        "sizeBytes": 2018596,
        "sha256": "c16e164ae5259820f2d0269b399508f19e9a25ccf7597dc082c305b4443ee74d"
      },
      {
        "id": "qa-media-artifact-072",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/c1-08-public.png",
        "sizeBytes": 1642311,
        "sha256": "7a26cbec4f8053564a529e0ee45d2e3a34bcf9058927ee5774514276f4aff98f"
      },
      {
        "id": "qa-media-artifact-073",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/proof/frame-004057.png",
        "sizeBytes": 719273,
        "sha256": "778577a2b60200c32b7a773ed12a8d7b86e9e6af54faf36b078aab9f8942c93c"
      },
      {
        "id": "qa-media-artifact-074",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/proof/frame-004058.png",
        "sizeBytes": 798946,
        "sha256": "d54da9b5b3ef3647c7453a36402a8a2f746df5e6afb7a42cd28d2394c6a03d19"
      },
      {
        "id": "qa-media-artifact-075",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/proof/frame-004059.png",
        "sizeBytes": 808003,
        "sha256": "fc91268fb9befe81985dd39aff6b22ba788253dc9d56a8ec5c5ff274fb543d28"
      },
      {
        "id": "qa-media-artifact-076",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/proof/frame-004060.png",
        "sizeBytes": 808199,
        "sha256": "5aa3b2f5552ccc57c4fc0e99d4e6e65605145a40f3e9573092664d054a30a7d8"
      },
      {
        "id": "qa-media-artifact-077",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/proof/frame-004074.png",
        "sizeBytes": 687542,
        "sha256": "9606a5db96207005d2f452af0f13b2f0e3d6ceb81ebb279146a36dcb20c5638d"
      },
      {
        "id": "qa-media-artifact-078",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/proof/frame-004075.png",
        "sizeBytes": 821361,
        "sha256": "e539c830fcd039756933ecd51f1d438c5d3d71ea0ee15e1f46385dbdf7fc8a23"
      },
      {
        "id": "qa-media-artifact-079",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/proof/frame-004076.png",
        "sizeBytes": 821347,
        "sha256": "ae93ae0eda157e6c27c149d0444886b4d3d85a13aeee6ea5b2ea85ff2c88c1f2"
      },
      {
        "id": "qa-media-artifact-080",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/proof/frame-004077.png",
        "sizeBytes": 814435,
        "sha256": "e37bedb7be25ccf2ed4b9c8e69b00c2a4e1538bd984c6b484a3acc18fc49922b"
      },
      {
        "id": "qa-media-artifact-081",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/proof/frame-004158.png",
        "sizeBytes": 753018,
        "sha256": "cfab07b6b4904b03543ca3c40b57b04affb23c00c96dd93f2731fb571347e7bc"
      },
      {
        "id": "qa-media-artifact-082",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/proof/frame-004159.png",
        "sizeBytes": 883236,
        "sha256": "8b63991a00bdca3206322063cdd23139c8af895f8e216ce2d08a7d4cbf29b7ff"
      },
      {
        "id": "qa-media-artifact-083",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/proof/frame-004160.png",
        "sizeBytes": 885181,
        "sha256": "2d0cbb2d414cde2600e2877d838eb70da03c5fc30033677ff00f2938f688b28c"
      },
      {
        "id": "qa-media-artifact-084",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/proof/frame-004161.png",
        "sizeBytes": 879759,
        "sha256": "33baa7fd52c2104cbdea2a58816bffa1ce9f1ff465b0f76d18b863107759061a"
      },
      {
        "id": "qa-media-artifact-085",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/public/frame-002028.png",
        "sizeBytes": 3055191,
        "sha256": "f5aaa771f04494c90f32c761d03dd9eb48f77a831b77f49b0664ede843645140"
      },
      {
        "id": "qa-media-artifact-086",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/public/frame-002029.png",
        "sizeBytes": 3058753,
        "sha256": "d6a364f615b24cea789c89dd427f065337d08b1a6badfb3a7aef732eec720dc7"
      },
      {
        "id": "qa-media-artifact-087",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/public/frame-002030.png",
        "sizeBytes": 3063868,
        "sha256": "1bb47da2585855b51533a4494e2cd7159ba98c9e7172603f11fc20177b3479ec"
      },
      {
        "id": "qa-media-artifact-088",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/public/frame-002031.png",
        "sizeBytes": 3070687,
        "sha256": "03572ab0ec191516394573ddb2f5a4e11c5ee400901d632e3730b82b5542bfac"
      },
      {
        "id": "qa-media-artifact-089",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/public/frame-002037.png",
        "sizeBytes": 3072962,
        "sha256": "f962674b149d476e4173683d136eae10573bc2d6c0255cf50540fd88187729fa"
      },
      {
        "id": "qa-media-artifact-090",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/public/frame-002038.png",
        "sizeBytes": 3080832,
        "sha256": "4fb701923636039c13f2929595d45ff93f926e0f0d5881d24ac6d439e64b3b1f"
      },
      {
        "id": "qa-media-artifact-091",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/public/frame-002039.png",
        "sizeBytes": 3072852,
        "sha256": "bbaf14347c93dd47eee7d6c011c52ad990f12a689ca0d2f617cc2084b4b1d257"
      },
      {
        "id": "qa-media-artifact-092",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/public/frame-002040.png",
        "sizeBytes": 3073738,
        "sha256": "7730e671b9413beb05a1dd92b6f90193ad44c0e4e4f65db664ce92afad458a9a"
      },
      {
        "id": "qa-media-artifact-093",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/public/frame-002079.png",
        "sizeBytes": 3315666,
        "sha256": "eb93d02ccdb76ff5f70e7d311ba518256e2ac209d302d6895be159ff0c288f2b"
      },
      {
        "id": "qa-media-artifact-094",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/public/frame-002080.png",
        "sizeBytes": 3313092,
        "sha256": "f5a5e0bf032c4ac2fbd59b6dfaa292dd8ab7f9608ef69b06adae6f651229f7be"
      },
      {
        "id": "qa-media-artifact-095",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/public/frame-002081.png",
        "sizeBytes": 3301062,
        "sha256": "672bc74d3a9316f390038385022c6b42971c5efb09e3dbd2c5600ddfd7689ee0"
      },
      {
        "id": "qa-media-artifact-096",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/public/frame-002082.png",
        "sizeBytes": 3309193,
        "sha256": "0c3cc738b929b47feb85724a0d4d0af0576c16c943508bfe596ed99f68a5be9d"
      },
      {
        "id": "qa-media-artifact-097",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/proof/frame-004889.png",
        "sizeBytes": 740616,
        "sha256": "4dd70b5264152e29906b0d217a57f567f0bf700b2bebef06ab4edb186aac7c8d"
      },
      {
        "id": "qa-media-artifact-098",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/proof/frame-004890.png",
        "sizeBytes": 824133,
        "sha256": "8e3e5e12bdb76e028a710b437cacbeda3df91198ef6ca25363c1db2edf32bbb3"
      },
      {
        "id": "qa-media-artifact-099",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/proof/frame-004891.png",
        "sizeBytes": 835079,
        "sha256": "311b3446752f11d58e530d3e07eaca52471bbdcde2ef83b8252135f01fd1a2bf"
      },
      {
        "id": "qa-media-artifact-100",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/proof/frame-004892.png",
        "sizeBytes": 835431,
        "sha256": "c31bdad8309064e9bbf3cbf461673293cba58a5aaf2d11d53c322a176ec7e2c3"
      },
      {
        "id": "qa-media-artifact-101",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/proof/frame-004946.png",
        "sizeBytes": 703164,
        "sha256": "1722dffcec33f42fcb54d3220fb220a833da88a59ac1753d905f0243387e29c6"
      },
      {
        "id": "qa-media-artifact-102",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/proof/frame-004947.png",
        "sizeBytes": 870361,
        "sha256": "5f6109d939883fb06597091691c50cc8674d7d43ec7ff2ef19e58344f637525c"
      },
      {
        "id": "qa-media-artifact-103",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/proof/frame-004948.png",
        "sizeBytes": 869049,
        "sha256": "c18dbfbd55ffc8bbca4b73b94ca71dde9a1297a262a41f450a7700b04948157d"
      },
      {
        "id": "qa-media-artifact-104",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/proof/frame-004949.png",
        "sizeBytes": 884218,
        "sha256": "409e58169eb3ffac1c90f047cb4fe4320ef5f6e9e36c86e83d6362bbcdf89220"
      },
      {
        "id": "qa-media-artifact-105",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/proof/frame-005268.png",
        "sizeBytes": 720343,
        "sha256": "7e6e09aac40c919a8ae3a37ad2a56a3036931fc56dbbee293bc971351713c3b7"
      },
      {
        "id": "qa-media-artifact-106",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/proof/frame-005269.png",
        "sizeBytes": 871562,
        "sha256": "508a589626228bbc29930c1af14153be8d70cb889e00d076fb087278e880b6db"
      },
      {
        "id": "qa-media-artifact-107",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/proof/frame-005270.png",
        "sizeBytes": 871395,
        "sha256": "ca4123805b2d41c93ed7a862e319b2e3c2f83c420c8860c3c687cd086fa8161e"
      },
      {
        "id": "qa-media-artifact-108",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/proof/frame-005271.png",
        "sizeBytes": 865506,
        "sha256": "005f17d5ed7836bf4d334ceae247a5b3509d39a054a3894817f34e7da618dc64"
      },
      {
        "id": "qa-media-artifact-109",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/public/frame-002444.png",
        "sizeBytes": 3385403,
        "sha256": "1ddbd6c38d6edb4ef041989986f99718b864a4c7d9682eb9056f2e024769167e"
      },
      {
        "id": "qa-media-artifact-110",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/public/frame-002445.png",
        "sizeBytes": 3301270,
        "sha256": "07dcc28eed5b44da7c3125482f98772f2f73fcbee11a702121aca7bb68dbe444"
      },
      {
        "id": "qa-media-artifact-111",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/public/frame-002446.png",
        "sizeBytes": 3285998,
        "sha256": "ce771431654f1ec486b3eacdde7e06669154500b22562c88cbaa307958e1f4e7"
      },
      {
        "id": "qa-media-artifact-112",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/public/frame-002447.png",
        "sizeBytes": 3298304,
        "sha256": "58aee647916ebfdf186f2981022634317f40f321807f681bf6ded5811805ca60"
      },
      {
        "id": "qa-media-artifact-113",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/public/frame-002473.png",
        "sizeBytes": 3292212,
        "sha256": "1413c45e21b9384f3d3e3cfcd8f106904500d1eaf4e13875fb846277373ce1df"
      },
      {
        "id": "qa-media-artifact-114",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/public/frame-002474.png",
        "sizeBytes": 3326945,
        "sha256": "478433d373c9a984b195c2f461cc3e7fd8fecfb7d76a601d476390bd55a90fbc"
      },
      {
        "id": "qa-media-artifact-115",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/public/frame-002475.png",
        "sizeBytes": 3381089,
        "sha256": "713378dc46394ff1fa3e23fd62635bf4b8cec8bafcc97c50f5e06b9475bb9840"
      },
      {
        "id": "qa-media-artifact-116",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/public/frame-002476.png",
        "sizeBytes": 3381482,
        "sha256": "0f675f18818bdfeb2c7b3df175885c3e1fe26848631554369f66625a2f82327d"
      },
      {
        "id": "qa-media-artifact-117",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/public/frame-002634.png",
        "sizeBytes": 3185845,
        "sha256": "d3226b009b4d2f0eddf270b9235b779311517df9e77bbe631a99cf405e5935b7"
      },
      {
        "id": "qa-media-artifact-118",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/public/frame-002635.png",
        "sizeBytes": 3184165,
        "sha256": "635494c888f87427370e3ecfe546562768c89c1e273b39f2f05a37516fe29815"
      },
      {
        "id": "qa-media-artifact-119",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/public/frame-002636.png",
        "sizeBytes": 3187346,
        "sha256": "3944ad7b898c0ccd7e4d5be5a198e881737443af4fefdc37f74e0b503c4afd88"
      },
      {
        "id": "qa-media-artifact-120",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/public/frame-002637.png",
        "sizeBytes": 3174200,
        "sha256": "2b75af4a79a66decfcae97dee1ceade8ea37bb40a2445538c1403cecffc9a5d2"
      },
      {
        "id": "qa-media-artifact-121",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/proof/frame-005372.png",
        "sizeBytes": 731629,
        "sha256": "10f6e4cc1d9345d97a727b1b1e5595cf8156620cb94931716170e79ba67b3b8b"
      },
      {
        "id": "qa-media-artifact-122",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/proof/frame-005373.png",
        "sizeBytes": 876822,
        "sha256": "07c3b0a852cddcbed84334db035c15fe359f9b811a72430487c2c5ad8f27a2f5"
      },
      {
        "id": "qa-media-artifact-123",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/proof/frame-005374.png",
        "sizeBytes": 881161,
        "sha256": "9ae547018ea2bd3008855b05423f7bd481eceb377be2e8b5c2318aabb95760fa"
      },
      {
        "id": "qa-media-artifact-124",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/proof/frame-005375.png",
        "sizeBytes": 897821,
        "sha256": "bb91209ce9e67b96f7a1863745c8593872eca5492d4559c2528cad6144b1a316"
      },
      {
        "id": "qa-media-artifact-125",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/proof/frame-005477.png",
        "sizeBytes": 722889,
        "sha256": "34121fbf012126a14218f3fbbc8361febe350fc19586415e5a03aed794d51bc9"
      },
      {
        "id": "qa-media-artifact-126",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/proof/frame-005478.png",
        "sizeBytes": 891492,
        "sha256": "cc4563ac667af49c85be1dbeb732aedb18ff7b6b64feb69ef4d0ca66b17d4d59"
      },
      {
        "id": "qa-media-artifact-127",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/proof/frame-005479.png",
        "sizeBytes": 892736,
        "sha256": "1e8c7d0a95b7d7172f8d7b1818e078aaca41f3260cae4fc195b915c354312d1e"
      },
      {
        "id": "qa-media-artifact-128",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/proof/frame-005480.png",
        "sizeBytes": 894204,
        "sha256": "d081ca079cdccd475e2cd3c1e9d5d1b6e58fd245b2a8f0125d417baf205a2015"
      },
      {
        "id": "qa-media-artifact-129",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/proof/frame-005569.png",
        "sizeBytes": 733435,
        "sha256": "80b76fe5ed176478d0e31f928d05ff7895546635ce5a5e03213c999f2f532635"
      },
      {
        "id": "qa-media-artifact-130",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/proof/frame-005570.png",
        "sizeBytes": 861252,
        "sha256": "13391d76bf8c4d3e105660cde9dd17559076e57377316ee5c58eb9728302d2ad"
      },
      {
        "id": "qa-media-artifact-131",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/proof/frame-005571.png",
        "sizeBytes": 872180,
        "sha256": "5cd54a0895f10b28ad2d2a04a2db15b1ab5e87504c3249e040ad2da786760806"
      },
      {
        "id": "qa-media-artifact-132",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/proof/frame-005572.png",
        "sizeBytes": 872037,
        "sha256": "1ec7cdc0a84979b05081b1315921b1388072ac30d7fb13c8a75c1a80faa648a0"
      },
      {
        "id": "qa-media-artifact-133",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/public/frame-002685.png",
        "sizeBytes": 3234680,
        "sha256": "5e3e0a3a0c2e3c1040a8d0dda6ac42f5ce5d077d754b17244c5ab4b5c95f3aac"
      },
      {
        "id": "qa-media-artifact-134",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/public/frame-002686.png",
        "sizeBytes": 3272813,
        "sha256": "837973ec5285571bccfdd1f1e0407a6d868e44b58d2081dec2f68a023434c885"
      },
      {
        "id": "qa-media-artifact-135",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/public/frame-002687.png",
        "sizeBytes": 3288456,
        "sha256": "1384e42dd507d58f5a5261f996d680c0717ac39bfb630e1f64325558a80f0ef2"
      },
      {
        "id": "qa-media-artifact-136",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/public/frame-002688.png",
        "sizeBytes": 3370829,
        "sha256": "379458f146795bb916d87f235f175ef32252f6ab42fe24decddb082665142ea2"
      },
      {
        "id": "qa-media-artifact-137",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/public/frame-002738.png",
        "sizeBytes": 3324252,
        "sha256": "e624bc8ea82fcf5e57190084da1b23d48f023829c8fe828494e657c1e13113aa"
      },
      {
        "id": "qa-media-artifact-138",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/public/frame-002739.png",
        "sizeBytes": 3292615,
        "sha256": "8782d2b3809181ffe0b35195eb50faedf3cab58f4ba4632c6f1a2095fe35b58b"
      },
      {
        "id": "qa-media-artifact-139",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/public/frame-002740.png",
        "sizeBytes": 3291207,
        "sha256": "3f0ef22a36ebfeda464e9ea0343cad9b8ad8fc8d138600fa26bfe224e1b77d9e"
      },
      {
        "id": "qa-media-artifact-140",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/public/frame-002741.png",
        "sizeBytes": 3299891,
        "sha256": "3fa4a3f5c4e811cf972c4c711d4b6c0b7611f36198d498e8084b28df3098392c"
      },
      {
        "id": "qa-media-artifact-141",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/public/frame-002784.png",
        "sizeBytes": 2989632,
        "sha256": "93b9f846a4ffd3cf406dc3fce05942a365d430c2def852b57e7a7bd764828004"
      },
      {
        "id": "qa-media-artifact-142",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/public/frame-002785.png",
        "sizeBytes": 3016451,
        "sha256": "331d5c4b4b2f1b573e0bca2edfeaa14afa168589f2b1f24bcce2a69230b284d6"
      },
      {
        "id": "qa-media-artifact-143",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/public/frame-002786.png",
        "sizeBytes": 3019439,
        "sha256": "defdd70e5700e00f17390eea83cd4dff42ff1a83f72517a2ac0b50dc8247494d"
      },
      {
        "id": "qa-media-artifact-144",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/public/frame-002787.png",
        "sizeBytes": 3017517,
        "sha256": "ce554c42d1d45cba53af7b33708ab453a23b0cfca45be25e87873796173c1c27"
      },
      {
        "id": "qa-media-artifact-145",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/proof/frame-005617.png",
        "sizeBytes": 712683,
        "sha256": "07b5cbc79eb90cc0f5f3dfaccd60721ae497d47540405f98f9be355656b006cc"
      },
      {
        "id": "qa-media-artifact-146",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/proof/frame-005618.png",
        "sizeBytes": 900058,
        "sha256": "7b3ff2de2d5ea780023b80f41c840a84a53d06a27e6a268d7877b8154f62ac9d"
      },
      {
        "id": "qa-media-artifact-147",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/proof/frame-005619.png",
        "sizeBytes": 900684,
        "sha256": "63cf9e4761cb82c5211011e0adc15df8b6b1fbb2b7b371dd33b04a58ff670154"
      },
      {
        "id": "qa-media-artifact-148",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/proof/frame-005620.png",
        "sizeBytes": 901850,
        "sha256": "1a798e1adc70e4493fc7ddec7c2a514111004b5d4ad8b6eab79ea79862084193"
      },
      {
        "id": "qa-media-artifact-149",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/proof/frame-005660.png",
        "sizeBytes": 755134,
        "sha256": "8c8e7f90fcadbcde6a0711e70f68fa224b1a76415d715b3a99010a16b2811838"
      },
      {
        "id": "qa-media-artifact-150",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/proof/frame-005661.png",
        "sizeBytes": 919482,
        "sha256": "78f87011c7f282260544ff720d19fd0dda5a6f6b4646260c034ecd3ed295442e"
      },
      {
        "id": "qa-media-artifact-151",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/proof/frame-005662.png",
        "sizeBytes": 923382,
        "sha256": "79eeecc5544fbead679adc6d9e371077bf7bed10668f4a991f9b80978ad20fe5"
      },
      {
        "id": "qa-media-artifact-152",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/proof/frame-005663.png",
        "sizeBytes": 930283,
        "sha256": "55f3d439de376a0902a139c11a1534dd4737773bd82396e9b9e1ff7b60c0ed4f"
      },
      {
        "id": "qa-media-artifact-153",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/proof/frame-005708.png",
        "sizeBytes": 756830,
        "sha256": "dbf7778bbb2d9948b1271b520898fc80320509e1a7269241e5b250a1fb09b0f6"
      },
      {
        "id": "qa-media-artifact-154",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/proof/frame-005709.png",
        "sizeBytes": 915190,
        "sha256": "5bea5d92a5891c688a58ff32fe3701aaf2352cb83e7cc20dea7b13f0f52d380b"
      },
      {
        "id": "qa-media-artifact-155",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/proof/frame-005710.png",
        "sizeBytes": 913619,
        "sha256": "a0bdeef278d663cb3a5f4af72a306ecbee5f3b286597401570fd6ea8c76b4a44"
      },
      {
        "id": "qa-media-artifact-156",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/proof/frame-005711.png",
        "sizeBytes": 913688,
        "sha256": "cc8a21ee717155f847453442826ba4fedd9b9dda5c9ba56037abb6e3dc1e9725"
      },
      {
        "id": "qa-media-artifact-157",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/public/frame-002808.png",
        "sizeBytes": 3087868,
        "sha256": "beae9c27ecbd7bcbcd763b6c6eb128151fd36ac1e341e59f7ae27b3b9e5923a8"
      },
      {
        "id": "qa-media-artifact-158",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/public/frame-002809.png",
        "sizeBytes": 3135754,
        "sha256": "acfc08e02cb634ba708db3ad726802febf40b22a1c3c8f03faeefeccc8a78ba8"
      },
      {
        "id": "qa-media-artifact-159",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/public/frame-002810.png",
        "sizeBytes": 3142301,
        "sha256": "1281a9877c4e164df0f086bcbc26200e5b303a8a2063d25f1a4d7d3d560eef85"
      },
      {
        "id": "qa-media-artifact-160",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/public/frame-002811.png",
        "sizeBytes": 3132035,
        "sha256": "a572fff12344f05433bbde45f8492a6248209fa3be62f324c136df9631458416"
      },
      {
        "id": "qa-media-artifact-161",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/public/frame-002830.png",
        "sizeBytes": 3335768,
        "sha256": "17c1c18ec69ff2a9b60dc60d805ab54ad0363f3d698ff1fc3b89654340437029"
      },
      {
        "id": "qa-media-artifact-162",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/public/frame-002831.png",
        "sizeBytes": 3370654,
        "sha256": "9c4fe8fc56361c9c9fc65fe19d6a92821d337e1585204d8241bd6791f3d43663"
      },
      {
        "id": "qa-media-artifact-163",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/public/frame-002832.png",
        "sizeBytes": 3371408,
        "sha256": "7a6d5c9ac4634458dc232b38cc63927667ccce31dc2212d07068e54c0f7edcb0"
      },
      {
        "id": "qa-media-artifact-164",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/public/frame-002833.png",
        "sizeBytes": 3377252,
        "sha256": "9834b26a470c22589aa1a54b31b9f01264c3865fafbd9c3eb26a4237ea16c3b1"
      },
      {
        "id": "qa-media-artifact-165",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/public/frame-002854.png",
        "sizeBytes": 3319766,
        "sha256": "d08bab167cbac42853f5436afc8aa1123703afc2d49073786dc2f376bf8134ef"
      },
      {
        "id": "qa-media-artifact-166",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/public/frame-002855.png",
        "sizeBytes": 3341106,
        "sha256": "8a66f20a3876ff23d9eadd60577f24da0580c27bdfa65876b25085bb47427fff"
      },
      {
        "id": "qa-media-artifact-167",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/public/frame-002856.png",
        "sizeBytes": 3352496,
        "sha256": "04e0cd827832f83c50f9adfd14130815d860c9fc8e74641f96afafbd412eaaf7"
      },
      {
        "id": "qa-media-artifact-168",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/public/frame-002857.png",
        "sizeBytes": 3326863,
        "sha256": "65cdba125bca00bd8dda05df22576ad2e4681f32507c269af08ebdecdef2e693"
      },
      {
        "id": "qa-media-artifact-169",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008447.png",
        "sizeBytes": 760664,
        "sha256": "faac5902f146cbbaa5ef6d43db8d25a49733706888a5b1bf0131f56de637acf7"
      },
      {
        "id": "qa-media-artifact-170",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008448.png",
        "sizeBytes": 886014,
        "sha256": "9c8998a3ab26f9e7dab7ea0b2e4d1b47f1d8dc9cf6a7667437aebb6b21792938"
      },
      {
        "id": "qa-media-artifact-171",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008449.png",
        "sizeBytes": 900886,
        "sha256": "3e4b992cf7a3d312749495b7cb3ac69c93040ad3a329c5215c018220f8392597"
      },
      {
        "id": "qa-media-artifact-172",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008450.png",
        "sizeBytes": 900049,
        "sha256": "4aa7c913837a923eaa01d361338934863aae09fd331c16d7cab340183bd965ce"
      },
      {
        "id": "qa-media-artifact-173",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008635.png",
        "sizeBytes": 728140,
        "sha256": "806234d449449ec7da01f07a635d51498c62431de71790a0c76bee6456aeaffe"
      },
      {
        "id": "qa-media-artifact-174",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008636.png",
        "sizeBytes": 821394,
        "sha256": "7f59e3145e4a2fa5cc0035d6215007cb722af21c32cfbdd205b2c9e1713261d0"
      },
      {
        "id": "qa-media-artifact-175",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008637.png",
        "sizeBytes": 829683,
        "sha256": "25958001cca0d381bae1804396599c76eaf708cab452866258e5b3feb4b12880"
      },
      {
        "id": "qa-media-artifact-176",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008638.png",
        "sizeBytes": 829905,
        "sha256": "5470d340990cd512b4b2675e4a52465136fda742a12c367d587ff868bfd1d703"
      },
      {
        "id": "qa-media-artifact-177",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008709.png",
        "sizeBytes": 712847,
        "sha256": "c00b93f46a6203eac90c16b40b410859f366d1d861d82cfadb7e20bd46320156"
      },
      {
        "id": "qa-media-artifact-178",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008710.png",
        "sizeBytes": 839747,
        "sha256": "bcaf3c370f48d85450e6cb52e9e1853441b64e15e5a9574c78973c47fc5ad651"
      },
      {
        "id": "qa-media-artifact-179",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008711.png",
        "sizeBytes": 842488,
        "sha256": "0bb9ec92de7cdc8f5c4f68df25e4e53fe450626543e7500909c1b6b8f359e9bb"
      },
      {
        "id": "qa-media-artifact-180",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008712.png",
        "sizeBytes": 844011,
        "sha256": "6342600daf8abd2dc4fdb74955ba2cf6da7802c1e201626d48f1010a13f39a26"
      },
      {
        "id": "qa-media-artifact-181",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004223.png",
        "sizeBytes": 3368108,
        "sha256": "1960819a97b530c6cc490a5b7933399e57ff7049e9c73093ff7a1cc8fc723762"
      },
      {
        "id": "qa-media-artifact-182",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004225.png",
        "sizeBytes": 3453707,
        "sha256": "df5413af4e16ffcb2c754d3ffb8a1ee31bc83cd53314f5aa1e822a04e2718a37"
      },
      {
        "id": "qa-media-artifact-183",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004226.png",
        "sizeBytes": 3451852,
        "sha256": "bbfcccb863eea73b64761b76d8569505f91dbd88ddf5afe9c6c357f51a475d5a"
      },
      {
        "id": "qa-media-artifact-184",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004317.png",
        "sizeBytes": 3074334,
        "sha256": "52041489f870d5d1bb759150da1e6a894cc8bcf61097dc0c55b0c39de235a7bc"
      },
      {
        "id": "qa-media-artifact-185",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004318.png",
        "sizeBytes": 3076250,
        "sha256": "dec5c17f74e15c317309a6991b78aad2206706b85b8772bde55ffc91b19ac5f6"
      },
      {
        "id": "qa-media-artifact-186",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004319.png",
        "sizeBytes": 3077102,
        "sha256": "cb2fc835a4853510c5469d5d422260d5f784f6484592af663965763ed29df6b9"
      },
      {
        "id": "qa-media-artifact-187",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004320.png",
        "sizeBytes": 3084239,
        "sha256": "09e4b2ec932a2cb9fb5a10ad4d2851c448cc1f1c020732e458432a5a1b5492c4"
      },
      {
        "id": "qa-media-artifact-188",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004354.png",
        "sizeBytes": 3066478,
        "sha256": "e294e9b26a52e37779bbbd9faa1342406ace747848c3de23370a91b6b2a59a30"
      },
      {
        "id": "qa-media-artifact-189",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004355.png",
        "sizeBytes": 3073586,
        "sha256": "e34bc9a39cf8ed361b00c2848482c2110a2e84a05d08ff3ab52fc5b11afceb4f"
      },
      {
        "id": "qa-media-artifact-190",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004356.png",
        "sizeBytes": 3082974,
        "sha256": "1b67795c86abba4a678762be5e9656d5f673e5a1f813146b6cfcdc2538675780"
      },
      {
        "id": "qa-media-artifact-191",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004357.png",
        "sizeBytes": 3091495,
        "sha256": "95230a40a3c7cb01490f9a34a1f7e553b479e29ca2b193cdc7e4404136502456"
      },
      {
        "id": "qa-media-artifact-192",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010359.png",
        "sizeBytes": 755963,
        "sha256": "3ed1d4c1c6959cf17b58583ed0430e37840c3cefe55d3657302a0af8eafa8d80"
      },
      {
        "id": "qa-media-artifact-193",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010360.png",
        "sizeBytes": 815954,
        "sha256": "8bdeb18bf0ff42eda48dc8e81b99cc844deb87141cb014eddc77506c6d847a5d"
      },
      {
        "id": "qa-media-artifact-194",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010361.png",
        "sizeBytes": 822959,
        "sha256": "2b4d0bbe98f4da2292bec55781a1cfc27ebe4ba804b4a2f4b6bc87b42427134f"
      },
      {
        "id": "qa-media-artifact-195",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010362.png",
        "sizeBytes": 824127,
        "sha256": "83116405fcce113afb2dee1050a2ef3f1dc496f94e50e765dc4dba314ccfbffd"
      },
      {
        "id": "qa-media-artifact-196",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010392.png",
        "sizeBytes": 716790,
        "sha256": "d1477f55c8a16bf496f16aef77c2967c5a60a2c2fe468cb2952e736172853d1a"
      },
      {
        "id": "qa-media-artifact-197",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010393.png",
        "sizeBytes": 872123,
        "sha256": "e722cf75e41b13ae9ec1c8a1a545d06b6228b4120639370c017c8b989deeb4bb"
      },
      {
        "id": "qa-media-artifact-198",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010394.png",
        "sizeBytes": 872583,
        "sha256": "6a866826efca3a85edd068b0cc7f7abe2373cf767d84f6504c0cf1726a1ffc12"
      },
      {
        "id": "qa-media-artifact-199",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010395.png",
        "sizeBytes": 870671,
        "sha256": "5cde8ef37216dd0a9438db556c256577f0fa8d5129aeba11283c86b0efff1ae0"
      },
      {
        "id": "qa-media-artifact-200",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010529.png",
        "sizeBytes": 727374,
        "sha256": "76d0b5be3109546a316a4bac73690dbd07e3442f404c3145c92b5a1ed284bc65"
      },
      {
        "id": "qa-media-artifact-201",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010530.png",
        "sizeBytes": 838646,
        "sha256": "dfe5975dff06da9d6971ca52f98319299ee6c327d40c976a5bd1974c270bf708"
      },
      {
        "id": "qa-media-artifact-202",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010531.png",
        "sizeBytes": 852336,
        "sha256": "c6e684fbb22f515da790751954c00089e6bfd2b96cd6a72db47fe9e59d3e3528"
      },
      {
        "id": "qa-media-artifact-203",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010532.png",
        "sizeBytes": 851558,
        "sha256": "456fba29b4cc3d23c7efb96bd43b6e40a684ea5f8e41908e3b4e6962cd70661b"
      },
      {
        "id": "qa-media-artifact-204",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010645.png",
        "sizeBytes": 724461,
        "sha256": "54f3eb245ddd1b1fd2a3aa84a40f98d333084560b8911306bc5faee3a0eb9f0a"
      },
      {
        "id": "qa-media-artifact-205",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010646.png",
        "sizeBytes": 848643,
        "sha256": "81c25232581e4c2d0a7c6c0e1a6e65935942a4d1cc3977ae7655a7a24694bc4b"
      },
      {
        "id": "qa-media-artifact-206",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010647.png",
        "sizeBytes": 844730,
        "sha256": "f4b9012144cfb48b125eeae17e056f9eda39a13e6d8269455220d6a7781191b5"
      },
      {
        "id": "qa-media-artifact-207",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010648.png",
        "sizeBytes": 847063,
        "sha256": "80c74ebaa57966adee0bfc412350addc3f9186dc2811a2b828848ca1b86b9870"
      },
      {
        "id": "qa-media-artifact-208",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005179.png",
        "sizeBytes": 3210548,
        "sha256": "b5703c88b9e9823965e7b91876afefd4206c85dd9901cb7f5a990ea4b26f6c32"
      },
      {
        "id": "qa-media-artifact-209",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005180.png",
        "sizeBytes": 3214391,
        "sha256": "3c76e04de463d891351e197ad5814819bfcdd45b944573541ed693bc32e2db4f"
      },
      {
        "id": "qa-media-artifact-210",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005181.png",
        "sizeBytes": 3220884,
        "sha256": "7c5dbf27c6d25f0bd2d940527ae189dffa2f3d5cafaef8b69060c23a501704b5"
      },
      {
        "id": "qa-media-artifact-211",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005182.png",
        "sizeBytes": 3229777,
        "sha256": "cc7277dcf2f77b240321d8291cf473942a513df365adc4e066ded7dd5765ff6b"
      },
      {
        "id": "qa-media-artifact-212",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005196.png",
        "sizeBytes": 3220313,
        "sha256": "25902b337bb63b509c441dbdf5dc6c696428bd01bcd12216ad4f29e8f5855a39"
      },
      {
        "id": "qa-media-artifact-213",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005197.png",
        "sizeBytes": 3236950,
        "sha256": "b4ee2f1a6c4af5d96d96643778cdbaffd4564a5690404be67d7f937852278b17"
      },
      {
        "id": "qa-media-artifact-214",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005198.png",
        "sizeBytes": 3235456,
        "sha256": "c42814bf39b7ab9c4b1a9efd3a106272696bc30300d17aba8fde45dc5fbe4639"
      },
      {
        "id": "qa-media-artifact-215",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005199.png",
        "sizeBytes": 3231830,
        "sha256": "3ebf1006825a990995f056ac0640d016c6d817505213622f6e6466bd8854dfaf"
      },
      {
        "id": "qa-media-artifact-216",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005264.png",
        "sizeBytes": 3024045,
        "sha256": "d10cdcc5c380ef7835cd04debf0bec7d36ff7db1455e5e1f74bce68f7cc9737c"
      },
      {
        "id": "qa-media-artifact-217",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005265.png",
        "sizeBytes": 3043588,
        "sha256": "91d6294a66c4411636a352d26676eae891f725e54cf00dfcf418efb9415202d8"
      },
      {
        "id": "qa-media-artifact-218",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005266.png",
        "sizeBytes": 3046441,
        "sha256": "5b82463b4504f809cb1d1954d00cda703fa0d31c056da18ec6609a7ca654a26b"
      },
      {
        "id": "qa-media-artifact-219",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005267.png",
        "sizeBytes": 3042363,
        "sha256": "7ad36700f748730ad922ca938f431d0890bca25ba505bf74c73f0140e9fd9ee9"
      },
      {
        "id": "qa-media-artifact-220",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005322.png",
        "sizeBytes": 3157005,
        "sha256": "d2787bab338c7df974df1bbcb4d7cf32a3f54eb3b05805472c47ec5e7b044f7d"
      },
      {
        "id": "qa-media-artifact-221",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005323.png",
        "sizeBytes": 3156164,
        "sha256": "fea4f874ef99879a4055ddcaa1843f24ba33a8c086a3945cfd27099aa17ce737"
      },
      {
        "id": "qa-media-artifact-222",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005324.png",
        "sizeBytes": 3162076,
        "sha256": "93b47baed1388c3f8952ebfbf0265c60fa6f4999bf0ff2b38f0b682f7b804277"
      },
      {
        "id": "qa-media-artifact-223",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005325.png",
        "sizeBytes": 3164051,
        "sha256": "39c2d82b17cb023b80f04fbc0806f35b758856cc4a209795b7bee8c5b331c22d"
      },
      {
        "id": "qa-media-artifact-224",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/release-sheets/c1-06-proof.png",
        "sizeBytes": 1631963,
        "sha256": "a173b9dcfd116fce368ff90e51da13544104c15bbba60c6fcec5dc4413097d04"
      },
      {
        "id": "qa-media-artifact-225",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/release-sheets/c1-06-public.png",
        "sizeBytes": 1261156,
        "sha256": "00185e7b9cb879bd6e5d84c64d1b501f68fc14f6da322751ad1d9bba43823588"
      },
      {
        "id": "qa-media-artifact-226",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/release-sheets/c1-07-proof.png",
        "sizeBytes": 1796230,
        "sha256": "963802ad7d90b82b6d487dd7ff19308c72303bee4ce0de8ed5d80bd4279fb675"
      },
      {
        "id": "qa-media-artifact-227",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/release-sheets/c1-07-public.png",
        "sizeBytes": 1408730,
        "sha256": "aba668a4ee3de241ee91c8fcad74343939c8caa50426c15d18dfdec190d67488"
      },
      {
        "id": "qa-media-artifact-228",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/release-sheets/c1-08-proof.png",
        "sizeBytes": 1981252,
        "sha256": "6fe28e234b42ae07254caaae4fc34e5e209702242c6eb7b92112e232cbdd17e8"
      },
      {
        "id": "qa-media-artifact-229",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/release-sheets/c1-08-public.png",
        "sizeBytes": 1604186,
        "sha256": "179255aa79e20318916b721c8724bd990bd526785745cd4d1c48d39e9c62ca7a"
      },
      {
        "id": "qa-media-artifact-230",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/proof/frame-004937.png",
        "sizeBytes": 852401,
        "sha256": "5ca1e16d7dc9fa813bc4294e0760678587ce2a69532dab108f14ba5b1754b83f"
      },
      {
        "id": "qa-media-artifact-231",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/proof/frame-004938.png",
        "sizeBytes": 698930,
        "sha256": "bced5cac448e31a28e7b466f9aaf543a64a89b9a84711cc821d20f06516cf827"
      },
      {
        "id": "qa-media-artifact-232",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/proof/frame-004939.png",
        "sizeBytes": 700551,
        "sha256": "f4bb334ee1334364ffede69912e2779402ec3b20fa9e6b82c0b04e05e275db74"
      },
      {
        "id": "qa-media-artifact-233",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/proof/frame-004940.png",
        "sizeBytes": 699788,
        "sha256": "fa61f16dad6b59e7eded04a0890fc93a27e29a5a4474699642a1770b2a9df3f6"
      },
      {
        "id": "qa-media-artifact-234",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/proof/frame-005254.png",
        "sizeBytes": 881948,
        "sha256": "8e2bb9a9d937c2d602202d141efc4a6c6255fc9f8ea495965f27cc06ec2222fd"
      },
      {
        "id": "qa-media-artifact-235",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/proof/frame-005255.png",
        "sizeBytes": 711429,
        "sha256": "5268c4d0547f70507edd3623f246ce086390d930d67e765be398ae6f3defc8fb"
      },
      {
        "id": "qa-media-artifact-236",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/proof/frame-005256.png",
        "sizeBytes": 714195,
        "sha256": "bca4279713290144b4d7d71da491eab54dea61c718661b60c29594611a5a78d5"
      },
      {
        "id": "qa-media-artifact-237",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/proof/frame-005257.png",
        "sizeBytes": 716235,
        "sha256": "a3a76eec63d64a5642797817ddd81c699f983e67f709aeb6692966e0778702f7"
      },
      {
        "id": "qa-media-artifact-238",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/proof/frame-005365.png",
        "sizeBytes": 885197,
        "sha256": "52c64f9afd0bbf4d462fb4ad6b83bc76774bdd8f94633fd2c5a81eebfe9215c5"
      },
      {
        "id": "qa-media-artifact-239",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/proof/frame-005366.png",
        "sizeBytes": 724160,
        "sha256": "f4f939e665c56e11795f2d079e4636b7b9d0264315e3ba700e84a0d399a49d8d"
      },
      {
        "id": "qa-media-artifact-240",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/proof/frame-005367.png",
        "sizeBytes": 729816,
        "sha256": "2ae422b6a0a391d9543d041b3957c03a08c5167ec44a7dc90a14f59026cccf3f"
      },
      {
        "id": "qa-media-artifact-241",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/proof/frame-005368.png",
        "sizeBytes": 732394,
        "sha256": "9ae72e342ee0a71c2620d87d590368a519d6252531c0ce73c8bb5cd670640e8a"
      },
      {
        "id": "qa-media-artifact-242",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/public/frame-002468.png",
        "sizeBytes": 3285348,
        "sha256": "9bed75ef0caa103eacb4c59bafd26e42ae6366fe3f6d2a506848b3a28e3a4144"
      },
      {
        "id": "qa-media-artifact-243",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/public/frame-002469.png",
        "sizeBytes": 3286096,
        "sha256": "206b6e95abb4aa4f9ede2488edb9be13c378610f05d9439cea9487a2bcc31590"
      },
      {
        "id": "qa-media-artifact-244",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/public/frame-002470.png",
        "sizeBytes": 3286827,
        "sha256": "f0f982f6041d99beb4648c105f0d0fb193499252adfa5b3c05a4e14308516372"
      },
      {
        "id": "qa-media-artifact-245",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/public/frame-002471.png",
        "sizeBytes": 3286019,
        "sha256": "81a51d9b454357197fa5ab62974309e5de1d6a5e90515b1d88bd2b233c6e6ff8"
      },
      {
        "id": "qa-media-artifact-246",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/public/frame-002627.png",
        "sizeBytes": 3200289,
        "sha256": "869718f1245fe5d3bc7014c7340e42ff00b583ecc4c64bad4e5de1ac905c8db0"
      },
      {
        "id": "qa-media-artifact-247",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/public/frame-002628.png",
        "sizeBytes": 3195166,
        "sha256": "0cbd79fc31c46054b67b2ad63f7cf6ecb4e661143ad214c6cf8a0e6f01425da2"
      },
      {
        "id": "qa-media-artifact-248",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/public/frame-002629.png",
        "sizeBytes": 3192631,
        "sha256": "6a9c11f19ef44f44a3c677fc32b892e99411c9d973c3c9fbae0152ef97868e30"
      },
      {
        "id": "qa-media-artifact-249",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/public/frame-002630.png",
        "sizeBytes": 3195096,
        "sha256": "6f88a0ed87f857cfd9d881727e8dfa710e54a8441ff5440ef21c2eddf5bf4af4"
      },
      {
        "id": "qa-media-artifact-250",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/public/frame-002682.png",
        "sizeBytes": 3197180,
        "sha256": "e02abeda793d25a6a6cc6d9b92b1549c5175486278e617cf1ac7c4bd1c1f74fe"
      },
      {
        "id": "qa-media-artifact-251",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/public/frame-002683.png",
        "sizeBytes": 3228011,
        "sha256": "b6a092008d8c1a4516de5e4804aa46d7eb50d5ab460d957e20a1e8d6402fb0a3"
      },
      {
        "id": "qa-media-artifact-252",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/public/frame-002684.png",
        "sizeBytes": 3233376,
        "sha256": "cc51888a6116c3058017eecf0994081640a3cd32a8b581c5dd0b2c8382f3972f"
      },
      {
        "id": "qa-media-artifact-253",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/public/frame-002685.png",
        "sizeBytes": 3234680,
        "sha256": "5e3e0a3a0c2e3c1040a8d0dda6ac42f5ce5d077d754b17244c5ab4b5c95f3aac"
      },
      {
        "id": "qa-media-artifact-254",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/proof/frame-005475.png",
        "sizeBytes": 907371,
        "sha256": "d06c3c4c39e17b25359ab96c104eb309945d7680212d8727496cd6edc339aa20"
      },
      {
        "id": "qa-media-artifact-255",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/proof/frame-005476.png",
        "sizeBytes": 728745,
        "sha256": "c3425a3f5664b34aafd9f52b2bbe1200168fc8310e3bd1fb7b479edae1993696"
      },
      {
        "id": "qa-media-artifact-256",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/proof/frame-005477.png",
        "sizeBytes": 722889,
        "sha256": "34121fbf012126a14218f3fbbc8361febe350fc19586415e5a03aed794d51bc9"
      },
      {
        "id": "qa-media-artifact-257",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/proof/frame-005478.png",
        "sizeBytes": 891492,
        "sha256": "cc4563ac667af49c85be1dbeb732aedb18ff7b6b64feb69ef4d0ca66b17d4d59"
      },
      {
        "id": "qa-media-artifact-258",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/proof/frame-005566.png",
        "sizeBytes": 896940,
        "sha256": "5ddf6bb3e5170113298ab0dff7acb533563d498f72324899527f907f479e29a9"
      },
      {
        "id": "qa-media-artifact-259",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/proof/frame-005567.png",
        "sizeBytes": 731624,
        "sha256": "48cdeaf3e7de13e0d942c8aea2bf74b8d02eb62cd84f7f348052302d39be2db3"
      },
      {
        "id": "qa-media-artifact-260",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/proof/frame-005568.png",
        "sizeBytes": 733221,
        "sha256": "5516f3facb2d55756bb2c6ed8307d754fb33266d592ac6152764f0da12e3c9f8"
      },
      {
        "id": "qa-media-artifact-261",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/proof/frame-005569.png",
        "sizeBytes": 733435,
        "sha256": "80b76fe5ed176478d0e31f928d05ff7895546635ce5a5e03213c999f2f532635"
      },
      {
        "id": "qa-media-artifact-262",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/proof/frame-005614.png",
        "sizeBytes": 883894,
        "sha256": "a8da04c7cf6efe18cbc7afb852701b2b2c877290b431de4a19b6dedda7b3db4f"
      },
      {
        "id": "qa-media-artifact-263",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/proof/frame-005615.png",
        "sizeBytes": 710800,
        "sha256": "952358decf9702cfb9ab142e6a529fb5b015751921922d0aa873c2456e1636da"
      },
      {
        "id": "qa-media-artifact-264",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/proof/frame-005616.png",
        "sizeBytes": 711971,
        "sha256": "6d2383fc32a5f1c5e4b4c2610934f6e8a8fc0b1e047c6956ac571919e037a345"
      },
      {
        "id": "qa-media-artifact-265",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/proof/frame-005617.png",
        "sizeBytes": 712683,
        "sha256": "07b5cbc79eb90cc0f5f3dfaccd60721ae497d47540405f98f9be355656b006cc"
      },
      {
        "id": "qa-media-artifact-266",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/public/frame-002737.png",
        "sizeBytes": 3309459,
        "sha256": "df847717f156c452293780dc5c571ad4131d0150aa37f7bcd14329dfb154205a"
      },
      {
        "id": "qa-media-artifact-267",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/public/frame-002738.png",
        "sizeBytes": 3324252,
        "sha256": "e624bc8ea82fcf5e57190084da1b23d48f023829c8fe828494e657c1e13113aa"
      },
      {
        "id": "qa-media-artifact-268",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/public/frame-002739.png",
        "sizeBytes": 3292615,
        "sha256": "8782d2b3809181ffe0b35195eb50faedf3cab58f4ba4632c6f1a2095fe35b58b"
      },
      {
        "id": "qa-media-artifact-269",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/public/frame-002740.png",
        "sizeBytes": 3291207,
        "sha256": "3f0ef22a36ebfeda464e9ea0343cad9b8ad8fc8d138600fa26bfe224e1b77d9e"
      },
      {
        "id": "qa-media-artifact-270",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/public/frame-002783.png",
        "sizeBytes": 2980451,
        "sha256": "2b857abbd19b2fc164041d163d4f6f8eb2b1be66325754453ae387d976c23079"
      },
      {
        "id": "qa-media-artifact-271",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/public/frame-002784.png",
        "sizeBytes": 2989632,
        "sha256": "93b9f846a4ffd3cf406dc3fce05942a365d430c2def852b57e7a7bd764828004"
      },
      {
        "id": "qa-media-artifact-272",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/public/frame-002785.png",
        "sizeBytes": 3016451,
        "sha256": "331d5c4b4b2f1b573e0bca2edfeaa14afa168589f2b1f24bcce2a69230b284d6"
      },
      {
        "id": "qa-media-artifact-273",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/public/frame-002786.png",
        "sizeBytes": 3019439,
        "sha256": "defdd70e5700e00f17390eea83cd4dff42ff1a83f72517a2ac0b50dc8247494d"
      },
      {
        "id": "qa-media-artifact-274",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/public/frame-002807.png",
        "sizeBytes": 3081072,
        "sha256": "dad1538057c5bec63669fbfbec2a467fa483a212ca09b6956980107f44c8a37e"
      },
      {
        "id": "qa-media-artifact-275",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/public/frame-002808.png",
        "sizeBytes": 3087868,
        "sha256": "beae9c27ecbd7bcbcd763b6c6eb128151fd36ac1e341e59f7ae27b3b9e5923a8"
      },
      {
        "id": "qa-media-artifact-276",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/public/frame-002809.png",
        "sizeBytes": 3135754,
        "sha256": "acfc08e02cb634ba708db3ad726802febf40b22a1c3c8f03faeefeccc8a78ba8"
      },
      {
        "id": "qa-media-artifact-277",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/public/frame-002810.png",
        "sizeBytes": 3142301,
        "sha256": "1281a9877c4e164df0f086bcbc26200e5b303a8a2063d25f1a4d7d3d560eef85"
      },
      {
        "id": "qa-media-artifact-278",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/proof/frame-005655.png",
        "sizeBytes": 927350,
        "sha256": "4d81038597539a063e7294b1db929a4fc2d4350d3d12c2121be877e9edfa610d"
      },
      {
        "id": "qa-media-artifact-279",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/proof/frame-005656.png",
        "sizeBytes": 749687,
        "sha256": "e09dc2b41c57e2b55a21c65d2c6ba7f4ebce1b415ec27c63a28c6bfbb57bbdba"
      },
      {
        "id": "qa-media-artifact-280",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/proof/frame-005657.png",
        "sizeBytes": 746916,
        "sha256": "8de6b3f85b94bea835f40915cb79c1bbb0c19dd00789f220e199af4f77657382"
      },
      {
        "id": "qa-media-artifact-281",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/proof/frame-005658.png",
        "sizeBytes": 750151,
        "sha256": "310c8d3555f6e40d12595e443de135adca5f680cd4cdf13df69aea59cd35e95a"
      },
      {
        "id": "qa-media-artifact-282",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/proof/frame-005703.png",
        "sizeBytes": 931664,
        "sha256": "da360aa157d9911f071daad4e95ac3a61b909aefd407e4e5c274ae55d57a41e6"
      },
      {
        "id": "qa-media-artifact-283",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/proof/frame-005704.png",
        "sizeBytes": 762525,
        "sha256": "e95a283306762e971a1d7e73f9e59f2c9db8d9481e0792f443e67d47ca4afee8"
      },
      {
        "id": "qa-media-artifact-284",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/proof/frame-005705.png",
        "sizeBytes": 756692,
        "sha256": "fe35b8525d56610161eaee48caaa9cb8059fecbae1e07c9861b3cea3e64c6c63"
      },
      {
        "id": "qa-media-artifact-285",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/proof/frame-005706.png",
        "sizeBytes": 759790,
        "sha256": "f0cb6e0be9c362c4c1db26f10555ac79a27ce4edfa5e7179edacdd2ac70f4cd2"
      },
      {
        "id": "qa-media-artifact-286",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/proof/frame-005908.png",
        "sizeBytes": 915583,
        "sha256": "d6a5eff49ac79590b6f9527f86023575b3fa3fb539ca0de408823d1ace0f39a0"
      },
      {
        "id": "qa-media-artifact-287",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/proof/frame-005909.png",
        "sizeBytes": 762314,
        "sha256": "cb469c87c0a56a761f14f8e373a3e9545dfefb7938490f8ff95f72219be8aa4b"
      },
      {
        "id": "qa-media-artifact-288",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/proof/frame-005910.png",
        "sizeBytes": 761297,
        "sha256": "65bcc27948601a6cb8341a6f80b001f158009de8bebdbcc277182d37bc0f0822"
      },
      {
        "id": "qa-media-artifact-289",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/proof/frame-005911.png",
        "sizeBytes": 758239,
        "sha256": "5d3115285a1fc56726209cb0b3b0ac2d122e446136d5a173f4e0fab36b5d9d28"
      },
      {
        "id": "qa-media-artifact-290",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/public/frame-002827.png",
        "sizeBytes": 3297577,
        "sha256": "114f0d29146273599545cf73af8c5ebaf860610c4e383dc31e721901316cdaa2"
      },
      {
        "id": "qa-media-artifact-291",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/public/frame-002828.png",
        "sizeBytes": 3300340,
        "sha256": "78380c4c2f8bcbc01fe84f282acc7767c158ca857ab015a649952ffe3d9c4914"
      },
      {
        "id": "qa-media-artifact-292",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/public/frame-002829.png",
        "sizeBytes": 3303768,
        "sha256": "12ab71a19ad100d3b5c41eac2bff9b5beb9c888e2be365c0a8db7acbb0b410ec"
      },
      {
        "id": "qa-media-artifact-293",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/public/frame-002830.png",
        "sizeBytes": 3335768,
        "sha256": "17c1c18ec69ff2a9b60dc60d805ab54ad0363f3d698ff1fc3b89654340437029"
      },
      {
        "id": "qa-media-artifact-294",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/public/frame-002851.png",
        "sizeBytes": 3321511,
        "sha256": "fb07ec84b2e4b8afe94f1ad255ab63fa3cd4ddd2c37b70a4b3e52dfcdafb9c4e"
      },
      {
        "id": "qa-media-artifact-295",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/public/frame-002852.png",
        "sizeBytes": 3313418,
        "sha256": "07d62e09853a10cd92b43524b9a0c21c63d1f3535ea7c7d81fb72a7c111cb762"
      },
      {
        "id": "qa-media-artifact-296",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/public/frame-002853.png",
        "sizeBytes": 3309699,
        "sha256": "60a00528991b5631761cf6718f5cde918a7dee5e93804af7df18b24530b18863"
      },
      {
        "id": "qa-media-artifact-297",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/public/frame-002854.png",
        "sizeBytes": 3319766,
        "sha256": "d08bab167cbac42853f5436afc8aa1123703afc2d49073786dc2f376bf8134ef"
      },
      {
        "id": "qa-media-artifact-298",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/public/frame-002953.png",
        "sizeBytes": 3354716,
        "sha256": "c70f4729637622dd0891de58d20aaf4c33d0f6e69baf7280081769c8bef0ab0c"
      },
      {
        "id": "qa-media-artifact-299",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/public/frame-002954.png",
        "sizeBytes": 3349596,
        "sha256": "acfa8957f92041d74aa4cdcfcc3c7719679708fa5811e0ef03bcc2437e76eb6d"
      },
      {
        "id": "qa-media-artifact-300",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/public/frame-002955.png",
        "sizeBytes": 3356407,
        "sha256": "35375d8c74ae10372a897fd372772b053ef8adcae952c808615316fcb82f07d7"
      },
      {
        "id": "qa-media-artifact-301",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/public/frame-002956.png",
        "sizeBytes": 3361251,
        "sha256": "e622e3def45067d919a4e3ec50564bdb92665ba685bcd8b26f1656699ce3ed1b"
      }
    ],
    "media": {
      "reference": {
        "artifactId": "reference-render",
        "fileSha256": {
          "value": "6029f9485afb2c72bee9ec324c5a37be993cce82dbe67c96d0f4fe7e71df6c97",
          "source": "sha256-file"
        },
        "video": {
          "codecName": "prores",
          "profile": "4444",
          "codecTag": "ap4h",
          "width": 2160,
          "height": 2160,
          "avgFrameRate": "60/1",
          "realFrameRate": "60/1",
          "decodedFrameCount": {
            "value": 9180,
            "source": "ffprobe-count_frames"
          },
          "pixelFormat": "yuv444p12le",
          "sampleAspectRatio": "1:1",
          "colorRange": "tv",
          "colorSpace": "bt709",
          "colorTransfer": "bt709",
          "colorPrimaries": "bt709",
          "startTime": "0.000000",
          "duration": "153.000000"
        },
        "container": {
          "duration": "153.000000"
        },
        "strictDecode": {
          "passed": true,
          "source": "ffmpeg-xerror-full-decode"
        }
      },
      "public": {
        "artifactId": "public-master",
        "fileSha256": {
          "value": "d00ec94c9649a5bf1ff794b48563535efcd4933147964440467c91e2751888a8",
          "source": "sha256-file"
        },
        "video": {
          "codecName": "hevc",
          "codecTag": "hvc1",
          "width": 1080,
          "height": 1080,
          "avgFrameRate": "60/1",
          "realFrameRate": "60/1",
          "decodedFrameCount": {
            "value": 9180,
            "source": "ffprobe-count_frames"
          },
          "pixelFormat": "yuv420p10le",
          "sampleAspectRatio": "1:1",
          "colorRange": "tv",
          "colorSpace": "bt709",
          "colorTransfer": "bt709",
          "colorPrimaries": "bt709",
          "startTime": "0.000000",
          "duration": "153.000000"
        },
        "audio": {
          "codecName": "aac",
          "sampleRate": "44100",
          "channels": 2,
          "channelLayout": "stereo",
          "timeBase": "1/44100",
          "startPts": 0,
          "startTime": "0.000000",
          "durationTs": 6747300,
          "duration": "153.000000",
          "packetCount": {
            "value": 6591,
            "source": "ffprobe-count_packets"
          },
          "packetStreamSha256": {
            "value": "9d2cc3b8f0bd51b1fe0e990cc0d6d5cbb52a76e1b872b56ada849915b3856b24",
            "source": "stream-copy-sha256"
          }
        },
        "sourceAudio": {
          "timeBase": "1/44100",
          "startPts": 0,
          "startTime": "0.000000",
          "durationTs": 6747300,
          "duration": "153.000000",
          "packetCount": {
            "value": 6591,
            "source": "ffprobe-count_packets"
          },
          "packetStreamSha256": {
            "value": "9d2cc3b8f0bd51b1fe0e990cc0d6d5cbb52a76e1b872b56ada849915b3856b24",
            "source": "stream-copy-sha256"
          }
        },
        "container": {
          "duration": "153.000000",
          "faststart": {
            "moovBeforeMdat": true,
            "source": "parsed-atom-order"
          }
        },
        "strictDecode": {
          "passed": true,
          "source": "ffmpeg-xerror-full-decode"
        }
      },
      "proof": {
        "artifactId": "sync-proof",
        "fileSha256": {
          "value": "edb93cfe0972ddbb8488b90a252289028f569a93b0f5a577b790625866d423ae",
          "source": "sha256-file"
        },
        "video": {
          "codecName": "h264",
          "codecTag": "avc1",
          "width": 1080,
          "height": 1080,
          "avgFrameRate": "120/1",
          "realFrameRate": "120/1",
          "decodedFrameCount": {
            "value": 18360,
            "source": "ffprobe-count_frames"
          },
          "pixelFormat": "yuv420p",
          "sampleAspectRatio": "1:1",
          "colorRange": "tv",
          "colorSpace": "bt709",
          "colorTransfer": "bt709",
          "colorPrimaries": "bt709",
          "startTime": "0.000000",
          "duration": "153.000000"
        },
        "audio": {
          "codecName": "aac",
          "sampleRate": "44100",
          "channels": 2,
          "channelLayout": "stereo",
          "timeBase": "1/44100",
          "startPts": 0,
          "startTime": "0.000000",
          "durationTs": 6747300,
          "duration": "153.000000",
          "packetCount": {
            "value": 6591,
            "source": "ffprobe-count_packets"
          },
          "packetStreamSha256": {
            "value": "9d2cc3b8f0bd51b1fe0e990cc0d6d5cbb52a76e1b872b56ada849915b3856b24",
            "source": "stream-copy-sha256"
          }
        },
        "sourceAudio": {
          "timeBase": "1/44100",
          "startPts": 0,
          "startTime": "0.000000",
          "durationTs": 6747300,
          "duration": "153.000000",
          "packetCount": {
            "value": 6591,
            "source": "ffprobe-count_packets"
          },
          "packetStreamSha256": {
            "value": "9d2cc3b8f0bd51b1fe0e990cc0d6d5cbb52a76e1b872b56ada849915b3856b24",
            "source": "stream-copy-sha256"
          }
        },
        "container": {
          "duration": "153.000000",
          "faststart": {
            "moovBeforeMdat": true,
            "source": "parsed-atom-order"
          }
        },
        "strictDecode": {
          "passed": true,
          "source": "ffmpeg-xerror-full-decode"
        }
      }
    },
    "qaCoverage": {
      "lineIds": [
        "C1-01",
        "C1-02",
        "C1-03",
        "C1-04",
        "C1-05",
        "C1-06",
        "C1-07",
        "C1-08",
        "V1-01",
        "V1-02",
        "V1-03",
        "V1-04",
        "V1-05",
        "V1-06",
        "V1-07",
        "V1-08",
        "C2-01",
        "C2-02",
        "C2-03",
        "C2-04",
        "C2-05",
        "C2-06",
        "C2-07",
        "C2-08"
      ],
      "speedVariants": [
        "normal",
        "half"
      ],
      "dedicatedRanges": [
        "v1-03",
        "v1-08",
        "chorus-1",
        "chorus-2",
        "first-act-40-50",
        "final-handoff"
      ],
      "proofRanges": [
        "v1-03",
        "v1-08"
      ],
      "cueIds": [
        "C1-04-C01",
        "C1-04-C02",
        "C1-04-C03",
        "C1-06-C01",
        "C1-06-C02",
        "C1-06-C03",
        "C1-07-C01",
        "C1-07-C02",
        "C1-07-C03",
        "C1-08-C01",
        "C1-08-C02",
        "C1-08-C03",
        "V1-03-C01",
        "V1-03-C02",
        "V1-03-C03",
        "V1-08-C01",
        "V1-08-C02",
        "V1-08-C03",
        "V1-08-C04"
      ],
      "contactOffsets": [
        -1,
        0,
        1,
        2
      ],
      "cadences": [
        60,
        120
      ],
      "stillPurposes": [
        "chrome",
        "handoff",
        "focus",
        "safe-area",
        "spectrum-peak",
        "backward-contact",
        "final-transition"
      ],
      "allArtifactsHashed": true,
      "mediaManifestArtifactId": "qa-media-manifest"
    },
    "requirementMatrix": {
      "criteria": [
        {
          "id": 1,
          "title": "Locked source audio authority",
          "status": "proved",
          "evidence": [
            {
              "id": "criterion-01-evidence-01",
              "kind": "source-audio",
              "artifact": "projects/tanisea-lyric-film/public/soundtrack.m4a",
              "sha256": "93084f293d491da1519732f3fa3cf6416c783d04e8ca18b5569c7608a8d4540d",
              "value": "criterion 1 verified"
            }
          ]
        },
        {
          "id": 2,
          "title": "Complete build and test verification",
          "status": "proved",
          "evidence": [
            {
              "id": "criterion-02-evidence-01",
              "kind": "test-result",
              "artifact": "projects/tanisea-lyric-film/work/qa/run-1/logs/check.log",
              "sha256": "cdb4b47d4e5731fac4b5b99d7a3e9e38abcb1f4761cf3ede735d13965cc210f8",
              "value": "criterion 2 verified"
            }
          ]
        },
        {
          "id": 3,
          "title": "Sample-indexed alignment authority",
          "status": "proved",
          "evidence": [
            {
              "id": "criterion-03-evidence-01",
              "kind": "alignment-manifest",
              "artifact": "projects/tanisea-lyric-film/alignment/tanisea-word-alignment-v3.json",
              "sha256": "06fe6c8d6ad4db5131ab4f9ab98be91ea87064fdeea58017c6b8c21ed8530f0b",
              "value": "criterion 3 verified"
            }
          ]
        },
        {
          "id": 4,
          "title": "Measured timing uncertainty bounds",
          "status": "proved",
          "evidence": [
            {
              "id": "criterion-04-evidence-01",
              "kind": "alignment-manifest",
              "artifact": "projects/tanisea-lyric-film/alignment/tanisea-word-alignment-v3.json",
              "sha256": "06fe6c8d6ad4db5131ab4f9ab98be91ea87064fdeea58017c6b8c21ed8530f0b",
              "value": "criterion 4 verified"
            }
          ]
        },
        {
          "id": 5,
          "title": "Reviewed semantic source-to-target mapping",
          "status": "proved",
          "evidence": [
            {
              "id": "criterion-05-evidence-01",
              "kind": "semantic-map",
              "artifact": "projects/tanisea-lyric-film/alignment/tanisea-word-alignment-v3.json",
              "sha256": "06fe6c8d6ad4db5131ab4f9ab98be91ea87064fdeea58017c6b8c21ed8530f0b",
              "value": "criterion 5 verified"
            }
          ]
        },
        {
          "id": 6,
          "title": "Backward activation and repeated-chorus semantics",
          "status": "proved",
          "evidence": [
            {
              "id": "criterion-06-evidence-01",
              "kind": "semantic-map",
              "artifact": "projects/tanisea-lyric-film/alignment/tanisea-word-alignment-v3.json",
              "sha256": "06fe6c8d6ad4db5131ab4f9ab98be91ea87064fdeea58017c6b8c21ed8530f0b",
              "value": "criterion 6 verified"
            }
          ]
        },
        {
          "id": 7,
          "title": "Public and proof cadence verification",
          "status": "proved",
          "evidence": [
            {
              "id": "criterion-07-evidence-01",
              "kind": "cadence-verification",
              "artifact": "projects/tanisea-lyric-film/work/qa/run-1/logs/verify-public.log",
              "sha256": "7d7d0311da35467f94c62bbfe6c8d70e546df2a00d1b209b4a8d326f1ce9b964",
              "value": "public cadence verified"
            },
            {
              "id": "criterion-07-evidence-02",
              "kind": "cadence-verification",
              "artifact": "projects/tanisea-lyric-film/work/qa/run-1/logs/verify-proof.log",
              "sha256": "89493fe1f61f0f5449729f6e8428154fa86e0a3e9a5d6dd742f1f5f79dd526ec",
              "value": "proof cadence verified"
            }
          ]
        },
        {
          "id": 8,
          "title": "Public chrome and upper-rail removal",
          "status": "proved",
          "evidence": [
            {
              "id": "criterion-08-evidence-01",
              "kind": "public-markup",
              "artifact": "projects/tanisea-lyric-film/work/qa/run-1/logs/verify-public-markup.log",
              "sha256": "13484bd0fab0faf61e86fa5d6179ef1ef258a99d4b6730c1a6698d6f29a768d1",
              "value": "criterion 8 verified"
            },
            {
              "id": "criterion-08-evidence-02",
              "kind": "encoded-frame",
              "artifact": "projects/tanisea-lyric-film/work/qa/run-1/selected-frames/chrome.png",
              "sha256": "7bc33ab82b2ea4eaca2124b79ae6c268b45bd5c27dd8e8fd123361a41712750b",
              "value": "public chrome encoded frame verified"
            }
          ]
        },
        {
          "id": 9,
          "title": "Lyric, spectrum, and safe-area layout",
          "status": "proved",
          "evidence": [
            {
              "id": "criterion-09-evidence-01",
              "kind": "layout-verification",
              "artifact": "projects/tanisea-lyric-film/work/qa/run-1/logs/layout-verify.log",
              "sha256": "7fd3213602cdd001189d057991d9037d59e41e68b8c4c27c96c8410bbba45ca3",
              "value": "criterion 9 verified"
            },
            {
              "id": "criterion-09-evidence-02",
              "kind": "encoded-frame",
              "artifact": "projects/tanisea-lyric-film/work/qa/run-1/selected-frames/safe-area.png",
              "sha256": "ea32e5a02a499b96e0e650e3355ebb92c48ced226420477e6eefad9e7efdf2d4",
              "value": "public safe-area encoded frame verified"
            }
          ]
        },
        {
          "id": 10,
          "title": "Repeated QA with no unexplained drift",
          "status": "pending-repeat",
          "evidence": [
            {
              "id": "criterion-10-evidence-01",
              "kind": "qa-run-comparison",
              "artifact": "projects/tanisea-lyric-film/work/qa/run-2/run-comparison.json",
              "sha256": "2c0d5fe5e46d565263caa2d15bee3bc81fc1fa0e738dcae973d9f4c571b754ed",
              "value": "criterion 10 baseline captured; repeat verification pending"
            }
          ]
        },
        {
          "id": 11,
          "title": "Release assets and documentation readiness",
          "status": "pending-publication",
          "evidence": [
            {
              "id": "criterion-11-evidence-01",
              "kind": "publication-readiness",
              "artifact": "projects/tanisea-lyric-film/output/Tanisea-Lyric-Film-vNext-60fps-Archival-Master.mp4",
              "sha256": "d00ec94c9649a5bf1ff794b48563535efcd4933147964440467c91e2751888a8",
              "value": "criterion 11 publication readiness verified locally"
            }
          ]
        }
      ]
    },
    "selectedFrames": [
      {
        "id": "chrome",
        "artifactId": "public-chrome-still",
        "composition": "LyricFilmVNext",
        "frame": 3844,
        "path": "projects/tanisea-lyric-film/work/qa/run-1/selected-frames/chrome.png",
        "sha256": "7bc33ab82b2ea4eaca2124b79ae6c268b45bd5c27dd8e8fd123361a41712750b"
      },
      {
        "id": "handoff",
        "artifactId": "public-handoff-still",
        "composition": "LyricFilmVNext",
        "frame": 7079,
        "path": "projects/tanisea-lyric-film/work/qa/run-1/selected-frames/handoff.png",
        "sha256": "209b0b54574f535ec4bc77ac1123604fbfc7f40ef573eba27ff45b69f4f5b641"
      },
      {
        "id": "focus",
        "artifactId": "public-focus-still",
        "composition": "LyricFilmVNext",
        "frame": 4355,
        "path": "projects/tanisea-lyric-film/work/qa/run-1/selected-frames/focus.png",
        "sha256": "e34bc9a39cf8ed361b00c2848482c2110a2e84a05d08ff3ab52fc5b11afceb4f"
      },
      {
        "id": "safe-area",
        "artifactId": "public-safe-area-still",
        "composition": "LyricFilmVNext",
        "frame": 4458,
        "path": "projects/tanisea-lyric-film/work/qa/run-1/selected-frames/safe-area.png",
        "sha256": "ea32e5a02a499b96e0e650e3355ebb92c48ced226420477e6eefad9e7efdf2d4"
      },
      {
        "id": "spectrum-peak",
        "artifactId": "public-spectrum-peak-still",
        "composition": "LyricFilmVNext",
        "frame": 2306,
        "path": "projects/tanisea-lyric-film/work/qa/run-1/selected-frames/spectrum-peak.png",
        "sha256": "d85992dd0f5bc8d88c9774fd1e3ade74c9eb2f4406fb2240d6bc541e3f64d038"
      },
      {
        "id": "backward-contact",
        "artifactId": "proof-backward-contact-still",
        "composition": "LyricFilmSyncProof",
        "frame": 10394,
        "path": "projects/tanisea-lyric-film/work/qa/run-1/selected-frames/backward-contact.png",
        "sha256": "6a866826efca3a85edd068b0cc7f7abe2373cf767d84f6504c0cf1726a1ffc12"
      },
      {
        "id": "final-transition",
        "artifactId": "reference-transition-still",
        "composition": "LyricFilmVNext",
        "frame": 7092,
        "path": "projects/tanisea-lyric-film/work/qa/run-1/selected-frames/final-transition.png",
        "sha256": "55209e993283bc807d5b3ac7928f6dac667ff1a607bfacc2dafefbe9c45b2b71"
      }
    ]
  },
  "authoritativeRun": {
    "schemaVersion": 1,
    "runId": "run-2",
    "fullMediaExecuted": true,
    "boundedClaim": "sample-indexed alignment with frame-bounded rendering",
    "git": {
      "headCommit": "5b0eef186e8e2ed5da2bfa0d88a5dd6625123a93",
      "trackedTreeSha256": "a56a23db5fa36bfb03fe5ec1d802507f46dd2a2b0aeb91a135a1d6a3dfd906d3",
      "worktreeDiffSha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "isClean": true,
      "statusEntries": []
    },
    "toolVersions": {
      "node": "v24.19.0",
      "npm": "11.7.0",
      "ffmpeg": "ffmpeg version 9.0-full_build-www.gyan.dev Copyright (c) 2000-2026 the FFmpeg developers",
      "ffprobe": "ffprobe version 9.0-full_build-www.gyan.dev Copyright (c) 2007-2026 the FFmpeg developers"
    },
    "commands": [
      {
        "id": "npm-ci",
        "command": "npm ci",
        "exitCode": 0,
        "durationMs": 12907.1078,
        "logPath": "projects/tanisea-lyric-film/work/qa/run-2/logs/npm-ci.log",
        "logSha256": "6eec2411148cbb9736e19080bb07fa7fc63036ee0693cb04abf8c0b698bb7bbd"
      },
      {
        "id": "check",
        "command": "npm run check",
        "exitCode": 0,
        "durationMs": 57285.362100000006,
        "logPath": "projects/tanisea-lyric-film/work/qa/run-2/logs/check.log",
        "logSha256": "dff722934a99c7bc79e1b06728cc7ad2082236ed989717eff8614fb16f23d852"
      },
      {
        "id": "alignment-verify",
        "command": "npm run alignment:verify",
        "exitCode": 0,
        "durationMs": 986.818299999999,
        "logPath": "projects/tanisea-lyric-film/work/qa/run-2/logs/alignment-verify.log",
        "logSha256": "2b67f1f60dc45bcd1279dd72adc9a21e3640f9557ab82ebcf7f0c273d9a2da99"
      },
      {
        "id": "layout-verify",
        "command": "npm run layout:verify",
        "exitCode": 0,
        "durationMs": 8428.353700000007,
        "logPath": "projects/tanisea-lyric-film/work/qa/run-2/logs/layout-verify.log",
        "logSha256": "82ebc7828329999b62c52cb0c4342455759306963562599508b798dbe6392ae5"
      },
      {
        "id": "compositions",
        "command": "npm run compositions",
        "exitCode": 0,
        "durationMs": 4991.877999999997,
        "logPath": "projects/tanisea-lyric-film/work/qa/run-2/logs/compositions.log",
        "logSha256": "d147ee76ddf38e2a879b42bae3a4856876861ca04b9f7a8bf156bf34442c3f41"
      },
      {
        "id": "verify-reference",
        "command": "npm run verify -- --kind reference",
        "exitCode": 0,
        "durationMs": 737868.7687,
        "logPath": "projects/tanisea-lyric-film/work/qa/run-2/logs/verify-reference.log",
        "logSha256": "e2f4b7cacca953bdb4494d0f28c141899e1a2d8243274228bccc59572ae04cc2"
      },
      {
        "id": "verify-public",
        "command": "npm run verify -- --kind public",
        "exitCode": 0,
        "durationMs": 22520.72609999997,
        "logPath": "projects/tanisea-lyric-film/work/qa/run-2/logs/verify-public.log",
        "logSha256": "22cc14785f7493296920c407a3d84d1bfe1091c8553b7485218965fd1aa07820"
      },
      {
        "id": "verify-proof",
        "command": "npm run verify -- --kind proof",
        "exitCode": 0,
        "durationMs": 31656.684800000046,
        "logPath": "projects/tanisea-lyric-film/work/qa/run-2/logs/verify-proof.log",
        "logSha256": "4170d792c559f583ac74e41e89f450e26a01fe19fe43176cf32be117a4b240dc"
      },
      {
        "id": "verify-public-markup",
        "command": "npm run test:run -- tests/release-gates.test.ts -t \"public-markup release gate\"",
        "exitCode": 0,
        "durationMs": 1662.781399999978,
        "logPath": "projects/tanisea-lyric-film/work/qa/run-2/logs/verify-public-markup.log",
        "logSha256": "479610e7cbdd0daa612376ec6253510c784aa002d523879246f95a0ef748a521"
      },
      {
        "id": "verify-matrix",
        "command": "npm run test:run -- tests/release-gates.test.ts -t \"requirement-matrix release gate\"",
        "exitCode": 0,
        "durationMs": 1400.7663000000175,
        "logPath": "projects/tanisea-lyric-film/work/qa/run-2/logs/verify-matrix.log",
        "logSha256": "f381cdf24ccc48a2feaee26743b858778b1d75c454adfa54838dc4261df8d37f"
      }
    ],
    "artifacts": [
      {
        "id": "source-audio",
        "kind": "source-audio",
        "path": "projects/tanisea-lyric-film/public/soundtrack.m4a",
        "sizeBytes": 2476341,
        "sha256": "93084f293d491da1519732f3fa3cf6416c783d04e8ca18b5569c7608a8d4540d"
      },
      {
        "id": "alignment-manifest",
        "kind": "alignment",
        "path": "projects/tanisea-lyric-film/alignment/tanisea-word-alignment-v3.json",
        "sizeBytes": 351148,
        "sha256": "06fe6c8d6ad4db5131ab4f9ab98be91ea87064fdeea58017c6b8c21ed8530f0b"
      },
      {
        "id": "audio-features",
        "kind": "features",
        "path": "projects/tanisea-lyric-film/public/audio-features.bin",
        "sizeBytes": 688532,
        "sha256": "c9453f8c6fb3de3f16e691b51b4155c5db7e313f5aac1cc7942904754d29b7cf"
      },
      {
        "id": "reference-render",
        "kind": "reference",
        "path": "projects/tanisea-lyric-film/output/Tanisea-Lyric-Film-vNext-reference-2x.mov",
        "sizeBytes": 28709540792,
        "sha256": "6029f9485afb2c72bee9ec324c5a37be993cce82dbe67c96d0f4fe7e71df6c97"
      },
      {
        "id": "public-master",
        "kind": "public",
        "path": "projects/tanisea-lyric-film/output/Tanisea-Lyric-Film-vNext-60fps-Archival-Master.mp4",
        "sizeBytes": 19499812,
        "sha256": "d00ec94c9649a5bf1ff794b48563535efcd4933147964440467c91e2751888a8"
      },
      {
        "id": "sync-proof",
        "kind": "proof",
        "path": "projects/tanisea-lyric-film/output/Tanisea-Lyric-Film-Sync-Proof-120fps.mp4",
        "sizeBytes": 158033925,
        "sha256": "edb93cfe0972ddbb8488b90a252289028f569a93b0f5a577b790625866d423ae"
      },
      {
        "id": "qa-media-manifest",
        "kind": "qa-manifest",
        "path": "projects/tanisea-lyric-film/work/qa/media/qa-media-manifest.json",
        "sizeBytes": 55571,
        "sha256": "b31f0c2a5526ed0971bbe2c1dd633e190b972ff4f86d731bb7ce6d519a649b45"
      },
      {
        "id": "v1-03-public-contact",
        "kind": "qa-contact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004224.png",
        "sizeBytes": 3462865,
        "sha256": "fe7b496da3350cd177422e097736c3ddadbb76ae1b2d6c461ac68262b40d7ebf"
      },
      {
        "id": "v1-03-public-contact-sheet",
        "kind": "qa-contact-sheet",
        "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/v1-03-public.png",
        "sizeBytes": 1764409,
        "sha256": "91eede8b52535d2886e0c0fbd296211c6ca084f90204279cd3c530701d811fa1"
      },
      {
        "id": "v1-03-proof-contact-sheet",
        "kind": "qa-contact-sheet",
        "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/v1-03-proof.png",
        "sizeBytes": 1979298,
        "sha256": "9a6accfd6af2f473c11ba25069331fa52b88d040216e497b86c1bc7adafee737"
      },
      {
        "id": "v1-08-public-contact-sheet",
        "kind": "qa-contact-sheet",
        "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/v1-08-public.png",
        "sizeBytes": 1811133,
        "sha256": "3ae1e502867f16507669f6ca33a7bfd160344cb3f44ade76a27f28eaccabb238"
      },
      {
        "id": "v1-08-proof-contact-sheet",
        "kind": "qa-contact-sheet",
        "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/v1-08-proof.png",
        "sizeBytes": 2616114,
        "sha256": "41ab0b4b9036680e29b1e0c75a31fd432aa60c32d4f3eae4f08059a2db2a6839"
      },
      {
        "id": "public-chrome-still",
        "kind": "qa-still",
        "path": "projects/tanisea-lyric-film/work/qa/media/stills/public-chrome.png",
        "sizeBytes": 3340059,
        "sha256": "7bc33ab82b2ea4eaca2124b79ae6c268b45bd5c27dd8e8fd123361a41712750b"
      },
      {
        "id": "public-handoff-still",
        "kind": "qa-still",
        "path": "projects/tanisea-lyric-film/work/qa/media/stills/public-handoff.png",
        "sizeBytes": 3219048,
        "sha256": "209b0b54574f535ec4bc77ac1123604fbfc7f40ef573eba27ff45b69f4f5b641"
      },
      {
        "id": "public-focus-still",
        "kind": "qa-still",
        "path": "projects/tanisea-lyric-film/work/qa/media/stills/public-focus.png",
        "sizeBytes": 3073586,
        "sha256": "e34bc9a39cf8ed361b00c2848482c2110a2e84a05d08ff3ab52fc5b11afceb4f"
      },
      {
        "id": "public-safe-area-still",
        "kind": "qa-still",
        "path": "projects/tanisea-lyric-film/work/qa/media/stills/public-safe-area.png",
        "sizeBytes": 3276104,
        "sha256": "ea32e5a02a499b96e0e650e3355ebb92c48ced226420477e6eefad9e7efdf2d4"
      },
      {
        "id": "public-spectrum-peak-still",
        "kind": "qa-still",
        "path": "projects/tanisea-lyric-film/work/qa/media/stills/public-spectrum-peak.png",
        "sizeBytes": 3436615,
        "sha256": "d85992dd0f5bc8d88c9774fd1e3ade74c9eb2f4406fb2240d6bc541e3f64d038"
      },
      {
        "id": "proof-backward-contact-still",
        "kind": "qa-still",
        "path": "projects/tanisea-lyric-film/work/qa/media/stills/proof-backward-contact.png",
        "sizeBytes": 872583,
        "sha256": "6a866826efca3a85edd068b0cc7f7abe2373cf767d84f6504c0cf1726a1ffc12"
      },
      {
        "id": "reference-transition-still",
        "kind": "qa-still",
        "path": "projects/tanisea-lyric-film/work/qa/media/stills/reference-final-transition.png",
        "sizeBytes": 20747170,
        "sha256": "55209e993283bc807d5b3ac7928f6dac667ff1a607bfacc2dafefbe9c45b2b71"
      },
      {
        "id": "qa-media-artifact-001",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/proof/v1-03-half.mp4",
        "sizeBytes": 1435309,
        "sha256": "0f27c5cafa84c8d2be107b3fb7737b631a9113eaf28c993a36a21333bdffad41"
      },
      {
        "id": "qa-media-artifact-002",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/proof/v1-03-normal.mp4",
        "sizeBytes": 1124864,
        "sha256": "2b7681fdc26099c5b4cd14dcae6e858f9a4d5bcea0ab361ab7e6a5dccdeb866e"
      },
      {
        "id": "qa-media-artifact-003",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/proof/v1-08-half.mp4",
        "sizeBytes": 1526866,
        "sha256": "6df69101e205e21f608b1f18ac84b3a74fc157719d12ba947c5b00e98a595d79"
      },
      {
        "id": "qa-media-artifact-004",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/proof/v1-08-normal.mp4",
        "sizeBytes": 1189797,
        "sha256": "84c1bb20a38c284b99393281f2a85fb09877aa1e44a81209e5cc92d8c54d9cdb"
      },
      {
        "id": "qa-media-artifact-005",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/chorus-1-half.mp4",
        "sizeBytes": 678968,
        "sha256": "9b7e8f9ef22cd6d3ed865e179663e2669277f08ae90901875bcdafa0b9399521"
      },
      {
        "id": "qa-media-artifact-006",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/chorus-1-normal.mp4",
        "sizeBytes": 488632,
        "sha256": "f5d5fcc23b4255e05c3a65a163bf477165dc1e8f141c449e886af6582c202115"
      },
      {
        "id": "qa-media-artifact-007",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/chorus-2-half.mp4",
        "sizeBytes": 722890,
        "sha256": "5089d2bbc62c2d3d2dffc63d6355b89e4d03f87f39d833dd324f71fda671c481"
      },
      {
        "id": "qa-media-artifact-008",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/chorus-2-normal.mp4",
        "sizeBytes": 521060,
        "sha256": "10d8816af80bbc4723e1237d4be2aa4c0a6c8327c31d5839909639b045677550"
      },
      {
        "id": "qa-media-artifact-009",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/final-handoff-half.mp4",
        "sizeBytes": 603882,
        "sha256": "1ddfe3b6d5eb5bc1c51cb09743fb6f15f36528cd3c2cbefcfb3498d488f63e8c"
      },
      {
        "id": "qa-media-artifact-010",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/final-handoff-normal.mp4",
        "sizeBytes": 430144,
        "sha256": "7ead21b9efb3903fe6a47024fa0874bc90a9447723c96cafc5e5b80cb3cb9c31"
      },
      {
        "id": "qa-media-artifact-011",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/first-act-40-50-half.mp4",
        "sizeBytes": 2984133,
        "sha256": "0550e33aa2e8eaf7a9c8de9bee685dedb56a4668f09b7853b76c59ad697aa326"
      },
      {
        "id": "qa-media-artifact-012",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/first-act-40-50-normal.mp4",
        "sizeBytes": 2054324,
        "sha256": "713d526fe3ec24f21f199dcbcf0784ffda3889b85b963c59704e779a269d16b4"
      },
      {
        "id": "qa-media-artifact-013",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-01-half.mp4",
        "sizeBytes": 628400,
        "sha256": "664b5e7c8688f2ea3cc7d78d01c0291101fe4adb6fbbd165e6ab4c3fc79e316e"
      },
      {
        "id": "qa-media-artifact-014",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-01-normal.mp4",
        "sizeBytes": 448343,
        "sha256": "331799672439c79e69d4e292f475cf2d0719163845340ee10f0bdfa03ef2fb60"
      },
      {
        "id": "qa-media-artifact-015",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-02-half.mp4",
        "sizeBytes": 579237,
        "sha256": "5a31a328a3551f2cf0ac6427f6ce9c881cbd7a980bc15453f61f341d31e57bf7"
      },
      {
        "id": "qa-media-artifact-016",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-02-normal.mp4",
        "sizeBytes": 416156,
        "sha256": "0a17dedc1925143cc16301dcd98c92129b609de0afa5bee37af6fbf5d91b5ffc"
      },
      {
        "id": "qa-media-artifact-017",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-03-half.mp4",
        "sizeBytes": 501297,
        "sha256": "700ac6cf0843513a48abf07253b129643ac653a618b2d8c4a93498946f08466d"
      },
      {
        "id": "qa-media-artifact-018",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-03-normal.mp4",
        "sizeBytes": 357208,
        "sha256": "4ae518e6577c0ccc66e43ceab9e707bda77a2a80b4ded9247c0a352da0f88c2c"
      },
      {
        "id": "qa-media-artifact-019",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-04-half.mp4",
        "sizeBytes": 596123,
        "sha256": "30eceb33bd7e21815a6af62d92626738717fdfb8dd5049a8179f0d750763efa8"
      },
      {
        "id": "qa-media-artifact-020",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-04-normal.mp4",
        "sizeBytes": 421571,
        "sha256": "3023d98adaea8a167e56fa2ce51a17919671140e04af594e6d01830e25c9c7f2"
      },
      {
        "id": "qa-media-artifact-021",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-05-half.mp4",
        "sizeBytes": 678968,
        "sha256": "9b7e8f9ef22cd6d3ed865e179663e2669277f08ae90901875bcdafa0b9399521"
      },
      {
        "id": "qa-media-artifact-022",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-05-normal.mp4",
        "sizeBytes": 488632,
        "sha256": "f5d5fcc23b4255e05c3a65a163bf477165dc1e8f141c449e886af6582c202115"
      },
      {
        "id": "qa-media-artifact-023",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-06-half.mp4",
        "sizeBytes": 593569,
        "sha256": "35912f9f639370259a76f549336d2b3ad0fbed7b3a9c2c89f4dc646b4be2c60f"
      },
      {
        "id": "qa-media-artifact-024",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-06-normal.mp4",
        "sizeBytes": 421680,
        "sha256": "6ca7bbdc6050ab666b96778724972f4091a767754e2755b7461888d0edc628d7"
      },
      {
        "id": "qa-media-artifact-025",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-07-half.mp4",
        "sizeBytes": 571268,
        "sha256": "aa548daebad7943360159bf2fff39f54886f19e7a58dc496fe7b5fa3f0273f8c"
      },
      {
        "id": "qa-media-artifact-026",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-07-normal.mp4",
        "sizeBytes": 407926,
        "sha256": "f2333ea7e0de9bf081021381ceef3c9c0e694555feff38c159dd8e3051238fec"
      },
      {
        "id": "qa-media-artifact-027",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-08-half.mp4",
        "sizeBytes": 552837,
        "sha256": "7ac316c9f23bfc57f899628c707d8ce22958be73213e2b9093f6362481f671a2"
      },
      {
        "id": "qa-media-artifact-028",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-08-normal.mp4",
        "sizeBytes": 392522,
        "sha256": "803573bdbd2934a16e666ad95420420846862ac44037dfa4e97cbb07d9fab9fe"
      },
      {
        "id": "qa-media-artifact-029",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-01-half.mp4",
        "sizeBytes": 594699,
        "sha256": "48255bdf6c3c9dcc2213b4be81881eaf6d947ab8034f92042cc7997aa5e33c56"
      },
      {
        "id": "qa-media-artifact-030",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-01-normal.mp4",
        "sizeBytes": 421286,
        "sha256": "0384e3547138f02269426c5183f3f3e37917fb27d15dd73db4202db4b3dc1733"
      },
      {
        "id": "qa-media-artifact-031",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-02-half.mp4",
        "sizeBytes": 664604,
        "sha256": "1b67b7bd321e060a662b573b748ac6375b8f7c8a1a52edfcfe8006f9ad9b74d0"
      },
      {
        "id": "qa-media-artifact-032",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-02-normal.mp4",
        "sizeBytes": 481221,
        "sha256": "c948482eca290c5e1a4d1fd010c8a2f99bdeadbd15a8e580a9adddfa8fa21b3e"
      },
      {
        "id": "qa-media-artifact-033",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-03-half.mp4",
        "sizeBytes": 536744,
        "sha256": "96ea9e805b0d0b7b7045f4c1f69132904a64b11a4e73824ee76382557e944aca"
      },
      {
        "id": "qa-media-artifact-034",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-03-normal.mp4",
        "sizeBytes": 382597,
        "sha256": "c754d6c34539b74adc7033d2d4d8ef45958867d6f3553ac3e9d3dc2e0c7f5ab3"
      },
      {
        "id": "qa-media-artifact-035",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-04-half.mp4",
        "sizeBytes": 623753,
        "sha256": "194c8fd531eca563c2dd6e3c8718e95bf2ef844a12961f972e76fccd5f250d74"
      },
      {
        "id": "qa-media-artifact-036",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-04-normal.mp4",
        "sizeBytes": 439229,
        "sha256": "ac713beb3c50ca8a63dfc728f72cd553bb5b878b86b8645f27aefe58e4ad7377"
      },
      {
        "id": "qa-media-artifact-037",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-05-half.mp4",
        "sizeBytes": 722890,
        "sha256": "5089d2bbc62c2d3d2dffc63d6355b89e4d03f87f39d833dd324f71fda671c481"
      },
      {
        "id": "qa-media-artifact-038",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-05-normal.mp4",
        "sizeBytes": 521060,
        "sha256": "10d8816af80bbc4723e1237d4be2aa4c0a6c8327c31d5839909639b045677550"
      },
      {
        "id": "qa-media-artifact-039",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-06-half.mp4",
        "sizeBytes": 696722,
        "sha256": "b60c225afee49988bf120cac88214e20553048a879225adb37cee44a5117120f"
      },
      {
        "id": "qa-media-artifact-040",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-06-normal.mp4",
        "sizeBytes": 493733,
        "sha256": "97e2e46f1401fa9c393f18679771c77a7e1e0f6c57839b56f43e232c9ccceb2d"
      },
      {
        "id": "qa-media-artifact-041",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-07-half.mp4",
        "sizeBytes": 583689,
        "sha256": "bcdbf6ed92d0622b38592da0b56f58f0ac84f27917787325150f76568a08ce56"
      },
      {
        "id": "qa-media-artifact-042",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-07-normal.mp4",
        "sizeBytes": 418776,
        "sha256": "b1190ff147ec8c34706232c1353a518cd099064f13b8d614c82d55185cbe83d8"
      },
      {
        "id": "qa-media-artifact-043",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-08-half.mp4",
        "sizeBytes": 595914,
        "sha256": "12092083f80207471b7ec39c7bf0855424d693d5f758c4d4a9e71a49b9609088"
      },
      {
        "id": "qa-media-artifact-044",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-08-normal.mp4",
        "sizeBytes": 423949,
        "sha256": "f1dd74ff31f367440ffb0eb3c11c219583ce177dd2ab907be85f01a0e6e35cf9"
      },
      {
        "id": "qa-media-artifact-045",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-01-half.mp4",
        "sizeBytes": 724809,
        "sha256": "de6faefa50b6c27d58cbbc6dbfb4b135b93396d2e088f3e67cd60724f0f363ca"
      },
      {
        "id": "qa-media-artifact-046",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-01-normal.mp4",
        "sizeBytes": 523887,
        "sha256": "e632af83bbd108f6e365e824e0d38e9bd5b9b1aad3347ff8e4365bd449d33b48"
      },
      {
        "id": "qa-media-artifact-047",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-02-half.mp4",
        "sizeBytes": 622318,
        "sha256": "26fd8f77d4c89c1cd85a198911c880bb342932e3b77ef3e7d4bf90d79a31a839"
      },
      {
        "id": "qa-media-artifact-048",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-02-normal.mp4",
        "sizeBytes": 440803,
        "sha256": "ea916de057d673819c8ad78b1ca56f1500f326703b85fb9353b0448a533a3abd"
      },
      {
        "id": "qa-media-artifact-049",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-03-half.mp4",
        "sizeBytes": 653442,
        "sha256": "1e0eca9397ac5766ccd1fe6719d82918bbe4ed847908e72074174c13dedfaa69"
      },
      {
        "id": "qa-media-artifact-050",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-03-normal.mp4",
        "sizeBytes": 461607,
        "sha256": "e973bfd41f55af38add1d178c5ecc9c9d2ebb14f930b9b7c8212640c7ff02579"
      },
      {
        "id": "qa-media-artifact-051",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-04-half.mp4",
        "sizeBytes": 658084,
        "sha256": "ddaaaab0fb3c38dc12c4088cca1b991ea828dfa922707404df4909b784183f97"
      },
      {
        "id": "qa-media-artifact-052",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-04-normal.mp4",
        "sizeBytes": 480982,
        "sha256": "007801d2e6671962c4eabb4f4f03d51bda020cb2cb4ea039731739ff9beab95e"
      },
      {
        "id": "qa-media-artifact-053",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-05-half.mp4",
        "sizeBytes": 669043,
        "sha256": "1bb552637901e953566cdfd39cf37803368dea40a36272518fdea23901f886a7"
      },
      {
        "id": "qa-media-artifact-054",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-05-normal.mp4",
        "sizeBytes": 478171,
        "sha256": "08ee8aef76b6334c7ea1f29ecee419f9fba1705638a1142a0d2cdde6f9568252"
      },
      {
        "id": "qa-media-artifact-055",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-06-half.mp4",
        "sizeBytes": 670728,
        "sha256": "d907a3d67d8fe6a5dce9b7e87399d0029d018291051ce335daaa7d88549fced2"
      },
      {
        "id": "qa-media-artifact-056",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-06-normal.mp4",
        "sizeBytes": 480654,
        "sha256": "b9d274391e8c0f4effceba2fe3cc18ecb744392e9c8eeacd05ad82774928199c"
      },
      {
        "id": "qa-media-artifact-057",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-07-half.mp4",
        "sizeBytes": 639749,
        "sha256": "a7db764f2f38582121416c4fce1f06934665dcbd94740de2db8e94aa384ca640"
      },
      {
        "id": "qa-media-artifact-058",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-07-normal.mp4",
        "sizeBytes": 458570,
        "sha256": "68c86ecf26484be8146226c3a5b6ea693489a4ff2f14e00c0ccb46748e283cca"
      },
      {
        "id": "qa-media-artifact-059",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-08-half.mp4",
        "sizeBytes": 657031,
        "sha256": "bc72ee4c70e6b8f51268311e979ef9f260e24f8ff7abc0b4b46e7ef521acc322"
      },
      {
        "id": "qa-media-artifact-060",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-08-normal.mp4",
        "sizeBytes": 479229,
        "sha256": "b0941ee467c19f7094c6ca9fb32537ba13b98390042ff02cb012570046ce2912"
      },
      {
        "id": "qa-media-artifact-061",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/v1-03-half.mp4",
        "sizeBytes": 653442,
        "sha256": "1e0eca9397ac5766ccd1fe6719d82918bbe4ed847908e72074174c13dedfaa69"
      },
      {
        "id": "qa-media-artifact-062",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/v1-03-normal.mp4",
        "sizeBytes": 461607,
        "sha256": "e973bfd41f55af38add1d178c5ecc9c9d2ebb14f930b9b7c8212640c7ff02579"
      },
      {
        "id": "qa-media-artifact-063",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/v1-08-half.mp4",
        "sizeBytes": 657031,
        "sha256": "bc72ee4c70e6b8f51268311e979ef9f260e24f8ff7abc0b4b46e7ef521acc322"
      },
      {
        "id": "qa-media-artifact-064",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/v1-08-normal.mp4",
        "sizeBytes": 479229,
        "sha256": "b0941ee467c19f7094c6ca9fb32537ba13b98390042ff02cb012570046ce2912"
      },
      {
        "id": "qa-media-artifact-065",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/c1-04-proof.png",
        "sizeBytes": 2032340,
        "sha256": "67f1b4a06339fd86bb2f94d09a57c08a07b2b787741017faa23386c1b1a27ce4"
      },
      {
        "id": "qa-media-artifact-066",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/c1-04-public.png",
        "sizeBytes": 1547256,
        "sha256": "c33dcf0d39339bc2fd61804844f6a12fab69238c84d46cf27ceb4628dbe32636"
      },
      {
        "id": "qa-media-artifact-067",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/c1-06-proof.png",
        "sizeBytes": 2063233,
        "sha256": "997af18a8cb509079875701e6f46d97ef1076b70bb62e4c5d6b4bf5333ddb198"
      },
      {
        "id": "qa-media-artifact-068",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/c1-06-public.png",
        "sizeBytes": 1599149,
        "sha256": "fef844c1bfe608152931582c6a4f84902c67b6b64f66e19eac041af8aa7896e8"
      },
      {
        "id": "qa-media-artifact-069",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/c1-07-proof.png",
        "sizeBytes": 2034517,
        "sha256": "0b7566c2ae83ef6a43cd3bacc9e4a87567144418c2e98431f65feb034faad5d0"
      },
      {
        "id": "qa-media-artifact-070",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/c1-07-public.png",
        "sizeBytes": 1690351,
        "sha256": "13325ca548e8d10d207cf0f51909e5432881a1c525c4c62793331e94a027e10b"
      },
      {
        "id": "qa-media-artifact-071",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/c1-08-proof.png",
        "sizeBytes": 2018596,
        "sha256": "c16e164ae5259820f2d0269b399508f19e9a25ccf7597dc082c305b4443ee74d"
      },
      {
        "id": "qa-media-artifact-072",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/c1-08-public.png",
        "sizeBytes": 1642311,
        "sha256": "7a26cbec4f8053564a529e0ee45d2e3a34bcf9058927ee5774514276f4aff98f"
      },
      {
        "id": "qa-media-artifact-073",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/proof/frame-004057.png",
        "sizeBytes": 719273,
        "sha256": "778577a2b60200c32b7a773ed12a8d7b86e9e6af54faf36b078aab9f8942c93c"
      },
      {
        "id": "qa-media-artifact-074",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/proof/frame-004058.png",
        "sizeBytes": 798946,
        "sha256": "d54da9b5b3ef3647c7453a36402a8a2f746df5e6afb7a42cd28d2394c6a03d19"
      },
      {
        "id": "qa-media-artifact-075",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/proof/frame-004059.png",
        "sizeBytes": 808003,
        "sha256": "fc91268fb9befe81985dd39aff6b22ba788253dc9d56a8ec5c5ff274fb543d28"
      },
      {
        "id": "qa-media-artifact-076",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/proof/frame-004060.png",
        "sizeBytes": 808199,
        "sha256": "5aa3b2f5552ccc57c4fc0e99d4e6e65605145a40f3e9573092664d054a30a7d8"
      },
      {
        "id": "qa-media-artifact-077",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/proof/frame-004074.png",
        "sizeBytes": 687542,
        "sha256": "9606a5db96207005d2f452af0f13b2f0e3d6ceb81ebb279146a36dcb20c5638d"
      },
      {
        "id": "qa-media-artifact-078",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/proof/frame-004075.png",
        "sizeBytes": 821361,
        "sha256": "e539c830fcd039756933ecd51f1d438c5d3d71ea0ee15e1f46385dbdf7fc8a23"
      },
      {
        "id": "qa-media-artifact-079",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/proof/frame-004076.png",
        "sizeBytes": 821347,
        "sha256": "ae93ae0eda157e6c27c149d0444886b4d3d85a13aeee6ea5b2ea85ff2c88c1f2"
      },
      {
        "id": "qa-media-artifact-080",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/proof/frame-004077.png",
        "sizeBytes": 814435,
        "sha256": "e37bedb7be25ccf2ed4b9c8e69b00c2a4e1538bd984c6b484a3acc18fc49922b"
      },
      {
        "id": "qa-media-artifact-081",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/proof/frame-004158.png",
        "sizeBytes": 753018,
        "sha256": "cfab07b6b4904b03543ca3c40b57b04affb23c00c96dd93f2731fb571347e7bc"
      },
      {
        "id": "qa-media-artifact-082",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/proof/frame-004159.png",
        "sizeBytes": 883236,
        "sha256": "8b63991a00bdca3206322063cdd23139c8af895f8e216ce2d08a7d4cbf29b7ff"
      },
      {
        "id": "qa-media-artifact-083",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/proof/frame-004160.png",
        "sizeBytes": 885181,
        "sha256": "2d0cbb2d414cde2600e2877d838eb70da03c5fc30033677ff00f2938f688b28c"
      },
      {
        "id": "qa-media-artifact-084",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/proof/frame-004161.png",
        "sizeBytes": 879759,
        "sha256": "33baa7fd52c2104cbdea2a58816bffa1ce9f1ff465b0f76d18b863107759061a"
      },
      {
        "id": "qa-media-artifact-085",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/public/frame-002028.png",
        "sizeBytes": 3055191,
        "sha256": "f5aaa771f04494c90f32c761d03dd9eb48f77a831b77f49b0664ede843645140"
      },
      {
        "id": "qa-media-artifact-086",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/public/frame-002029.png",
        "sizeBytes": 3058753,
        "sha256": "d6a364f615b24cea789c89dd427f065337d08b1a6badfb3a7aef732eec720dc7"
      },
      {
        "id": "qa-media-artifact-087",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/public/frame-002030.png",
        "sizeBytes": 3063868,
        "sha256": "1bb47da2585855b51533a4494e2cd7159ba98c9e7172603f11fc20177b3479ec"
      },
      {
        "id": "qa-media-artifact-088",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/public/frame-002031.png",
        "sizeBytes": 3070687,
        "sha256": "03572ab0ec191516394573ddb2f5a4e11c5ee400901d632e3730b82b5542bfac"
      },
      {
        "id": "qa-media-artifact-089",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/public/frame-002037.png",
        "sizeBytes": 3072962,
        "sha256": "f962674b149d476e4173683d136eae10573bc2d6c0255cf50540fd88187729fa"
      },
      {
        "id": "qa-media-artifact-090",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/public/frame-002038.png",
        "sizeBytes": 3080832,
        "sha256": "4fb701923636039c13f2929595d45ff93f926e0f0d5881d24ac6d439e64b3b1f"
      },
      {
        "id": "qa-media-artifact-091",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/public/frame-002039.png",
        "sizeBytes": 3072852,
        "sha256": "bbaf14347c93dd47eee7d6c011c52ad990f12a689ca0d2f617cc2084b4b1d257"
      },
      {
        "id": "qa-media-artifact-092",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/public/frame-002040.png",
        "sizeBytes": 3073738,
        "sha256": "7730e671b9413beb05a1dd92b6f90193ad44c0e4e4f65db664ce92afad458a9a"
      },
      {
        "id": "qa-media-artifact-093",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/public/frame-002079.png",
        "sizeBytes": 3315666,
        "sha256": "eb93d02ccdb76ff5f70e7d311ba518256e2ac209d302d6895be159ff0c288f2b"
      },
      {
        "id": "qa-media-artifact-094",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/public/frame-002080.png",
        "sizeBytes": 3313092,
        "sha256": "f5a5e0bf032c4ac2fbd59b6dfaa292dd8ab7f9608ef69b06adae6f651229f7be"
      },
      {
        "id": "qa-media-artifact-095",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/public/frame-002081.png",
        "sizeBytes": 3301062,
        "sha256": "672bc74d3a9316f390038385022c6b42971c5efb09e3dbd2c5600ddfd7689ee0"
      },
      {
        "id": "qa-media-artifact-096",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-04/public/frame-002082.png",
        "sizeBytes": 3309193,
        "sha256": "0c3cc738b929b47feb85724a0d4d0af0576c16c943508bfe596ed99f68a5be9d"
      },
      {
        "id": "qa-media-artifact-097",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/proof/frame-004889.png",
        "sizeBytes": 740616,
        "sha256": "4dd70b5264152e29906b0d217a57f567f0bf700b2bebef06ab4edb186aac7c8d"
      },
      {
        "id": "qa-media-artifact-098",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/proof/frame-004890.png",
        "sizeBytes": 824133,
        "sha256": "8e3e5e12bdb76e028a710b437cacbeda3df91198ef6ca25363c1db2edf32bbb3"
      },
      {
        "id": "qa-media-artifact-099",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/proof/frame-004891.png",
        "sizeBytes": 835079,
        "sha256": "311b3446752f11d58e530d3e07eaca52471bbdcde2ef83b8252135f01fd1a2bf"
      },
      {
        "id": "qa-media-artifact-100",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/proof/frame-004892.png",
        "sizeBytes": 835431,
        "sha256": "c31bdad8309064e9bbf3cbf461673293cba58a5aaf2d11d53c322a176ec7e2c3"
      },
      {
        "id": "qa-media-artifact-101",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/proof/frame-004946.png",
        "sizeBytes": 703164,
        "sha256": "1722dffcec33f42fcb54d3220fb220a833da88a59ac1753d905f0243387e29c6"
      },
      {
        "id": "qa-media-artifact-102",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/proof/frame-004947.png",
        "sizeBytes": 870361,
        "sha256": "5f6109d939883fb06597091691c50cc8674d7d43ec7ff2ef19e58344f637525c"
      },
      {
        "id": "qa-media-artifact-103",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/proof/frame-004948.png",
        "sizeBytes": 869049,
        "sha256": "c18dbfbd55ffc8bbca4b73b94ca71dde9a1297a262a41f450a7700b04948157d"
      },
      {
        "id": "qa-media-artifact-104",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/proof/frame-004949.png",
        "sizeBytes": 884218,
        "sha256": "409e58169eb3ffac1c90f047cb4fe4320ef5f6e9e36c86e83d6362bbcdf89220"
      },
      {
        "id": "qa-media-artifact-105",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/proof/frame-005268.png",
        "sizeBytes": 720343,
        "sha256": "7e6e09aac40c919a8ae3a37ad2a56a3036931fc56dbbee293bc971351713c3b7"
      },
      {
        "id": "qa-media-artifact-106",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/proof/frame-005269.png",
        "sizeBytes": 871562,
        "sha256": "508a589626228bbc29930c1af14153be8d70cb889e00d076fb087278e880b6db"
      },
      {
        "id": "qa-media-artifact-107",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/proof/frame-005270.png",
        "sizeBytes": 871395,
        "sha256": "ca4123805b2d41c93ed7a862e319b2e3c2f83c420c8860c3c687cd086fa8161e"
      },
      {
        "id": "qa-media-artifact-108",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/proof/frame-005271.png",
        "sizeBytes": 865506,
        "sha256": "005f17d5ed7836bf4d334ceae247a5b3509d39a054a3894817f34e7da618dc64"
      },
      {
        "id": "qa-media-artifact-109",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/public/frame-002444.png",
        "sizeBytes": 3385403,
        "sha256": "1ddbd6c38d6edb4ef041989986f99718b864a4c7d9682eb9056f2e024769167e"
      },
      {
        "id": "qa-media-artifact-110",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/public/frame-002445.png",
        "sizeBytes": 3301270,
        "sha256": "07dcc28eed5b44da7c3125482f98772f2f73fcbee11a702121aca7bb68dbe444"
      },
      {
        "id": "qa-media-artifact-111",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/public/frame-002446.png",
        "sizeBytes": 3285998,
        "sha256": "ce771431654f1ec486b3eacdde7e06669154500b22562c88cbaa307958e1f4e7"
      },
      {
        "id": "qa-media-artifact-112",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/public/frame-002447.png",
        "sizeBytes": 3298304,
        "sha256": "58aee647916ebfdf186f2981022634317f40f321807f681bf6ded5811805ca60"
      },
      {
        "id": "qa-media-artifact-113",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/public/frame-002473.png",
        "sizeBytes": 3292212,
        "sha256": "1413c45e21b9384f3d3e3cfcd8f106904500d1eaf4e13875fb846277373ce1df"
      },
      {
        "id": "qa-media-artifact-114",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/public/frame-002474.png",
        "sizeBytes": 3326945,
        "sha256": "478433d373c9a984b195c2f461cc3e7fd8fecfb7d76a601d476390bd55a90fbc"
      },
      {
        "id": "qa-media-artifact-115",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/public/frame-002475.png",
        "sizeBytes": 3381089,
        "sha256": "713378dc46394ff1fa3e23fd62635bf4b8cec8bafcc97c50f5e06b9475bb9840"
      },
      {
        "id": "qa-media-artifact-116",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/public/frame-002476.png",
        "sizeBytes": 3381482,
        "sha256": "0f675f18818bdfeb2c7b3df175885c3e1fe26848631554369f66625a2f82327d"
      },
      {
        "id": "qa-media-artifact-117",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/public/frame-002634.png",
        "sizeBytes": 3185845,
        "sha256": "d3226b009b4d2f0eddf270b9235b779311517df9e77bbe631a99cf405e5935b7"
      },
      {
        "id": "qa-media-artifact-118",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/public/frame-002635.png",
        "sizeBytes": 3184165,
        "sha256": "635494c888f87427370e3ecfe546562768c89c1e273b39f2f05a37516fe29815"
      },
      {
        "id": "qa-media-artifact-119",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/public/frame-002636.png",
        "sizeBytes": 3187346,
        "sha256": "3944ad7b898c0ccd7e4d5be5a198e881737443af4fefdc37f74e0b503c4afd88"
      },
      {
        "id": "qa-media-artifact-120",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-06/public/frame-002637.png",
        "sizeBytes": 3174200,
        "sha256": "2b75af4a79a66decfcae97dee1ceade8ea37bb40a2445538c1403cecffc9a5d2"
      },
      {
        "id": "qa-media-artifact-121",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/proof/frame-005372.png",
        "sizeBytes": 731629,
        "sha256": "10f6e4cc1d9345d97a727b1b1e5595cf8156620cb94931716170e79ba67b3b8b"
      },
      {
        "id": "qa-media-artifact-122",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/proof/frame-005373.png",
        "sizeBytes": 876822,
        "sha256": "07c3b0a852cddcbed84334db035c15fe359f9b811a72430487c2c5ad8f27a2f5"
      },
      {
        "id": "qa-media-artifact-123",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/proof/frame-005374.png",
        "sizeBytes": 881161,
        "sha256": "9ae547018ea2bd3008855b05423f7bd481eceb377be2e8b5c2318aabb95760fa"
      },
      {
        "id": "qa-media-artifact-124",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/proof/frame-005375.png",
        "sizeBytes": 897821,
        "sha256": "bb91209ce9e67b96f7a1863745c8593872eca5492d4559c2528cad6144b1a316"
      },
      {
        "id": "qa-media-artifact-125",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/proof/frame-005477.png",
        "sizeBytes": 722889,
        "sha256": "34121fbf012126a14218f3fbbc8361febe350fc19586415e5a03aed794d51bc9"
      },
      {
        "id": "qa-media-artifact-126",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/proof/frame-005478.png",
        "sizeBytes": 891492,
        "sha256": "cc4563ac667af49c85be1dbeb732aedb18ff7b6b64feb69ef4d0ca66b17d4d59"
      },
      {
        "id": "qa-media-artifact-127",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/proof/frame-005479.png",
        "sizeBytes": 892736,
        "sha256": "1e8c7d0a95b7d7172f8d7b1818e078aaca41f3260cae4fc195b915c354312d1e"
      },
      {
        "id": "qa-media-artifact-128",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/proof/frame-005480.png",
        "sizeBytes": 894204,
        "sha256": "d081ca079cdccd475e2cd3c1e9d5d1b6e58fd245b2a8f0125d417baf205a2015"
      },
      {
        "id": "qa-media-artifact-129",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/proof/frame-005569.png",
        "sizeBytes": 733435,
        "sha256": "80b76fe5ed176478d0e31f928d05ff7895546635ce5a5e03213c999f2f532635"
      },
      {
        "id": "qa-media-artifact-130",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/proof/frame-005570.png",
        "sizeBytes": 861252,
        "sha256": "13391d76bf8c4d3e105660cde9dd17559076e57377316ee5c58eb9728302d2ad"
      },
      {
        "id": "qa-media-artifact-131",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/proof/frame-005571.png",
        "sizeBytes": 872180,
        "sha256": "5cd54a0895f10b28ad2d2a04a2db15b1ab5e87504c3249e040ad2da786760806"
      },
      {
        "id": "qa-media-artifact-132",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/proof/frame-005572.png",
        "sizeBytes": 872037,
        "sha256": "1ec7cdc0a84979b05081b1315921b1388072ac30d7fb13c8a75c1a80faa648a0"
      },
      {
        "id": "qa-media-artifact-133",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/public/frame-002685.png",
        "sizeBytes": 3234680,
        "sha256": "5e3e0a3a0c2e3c1040a8d0dda6ac42f5ce5d077d754b17244c5ab4b5c95f3aac"
      },
      {
        "id": "qa-media-artifact-134",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/public/frame-002686.png",
        "sizeBytes": 3272813,
        "sha256": "837973ec5285571bccfdd1f1e0407a6d868e44b58d2081dec2f68a023434c885"
      },
      {
        "id": "qa-media-artifact-135",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/public/frame-002687.png",
        "sizeBytes": 3288456,
        "sha256": "1384e42dd507d58f5a5261f996d680c0717ac39bfb630e1f64325558a80f0ef2"
      },
      {
        "id": "qa-media-artifact-136",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/public/frame-002688.png",
        "sizeBytes": 3370829,
        "sha256": "379458f146795bb916d87f235f175ef32252f6ab42fe24decddb082665142ea2"
      },
      {
        "id": "qa-media-artifact-137",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/public/frame-002738.png",
        "sizeBytes": 3324252,
        "sha256": "e624bc8ea82fcf5e57190084da1b23d48f023829c8fe828494e657c1e13113aa"
      },
      {
        "id": "qa-media-artifact-138",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/public/frame-002739.png",
        "sizeBytes": 3292615,
        "sha256": "8782d2b3809181ffe0b35195eb50faedf3cab58f4ba4632c6f1a2095fe35b58b"
      },
      {
        "id": "qa-media-artifact-139",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/public/frame-002740.png",
        "sizeBytes": 3291207,
        "sha256": "3f0ef22a36ebfeda464e9ea0343cad9b8ad8fc8d138600fa26bfe224e1b77d9e"
      },
      {
        "id": "qa-media-artifact-140",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/public/frame-002741.png",
        "sizeBytes": 3299891,
        "sha256": "3fa4a3f5c4e811cf972c4c711d4b6c0b7611f36198d498e8084b28df3098392c"
      },
      {
        "id": "qa-media-artifact-141",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/public/frame-002784.png",
        "sizeBytes": 2989632,
        "sha256": "93b9f846a4ffd3cf406dc3fce05942a365d430c2def852b57e7a7bd764828004"
      },
      {
        "id": "qa-media-artifact-142",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/public/frame-002785.png",
        "sizeBytes": 3016451,
        "sha256": "331d5c4b4b2f1b573e0bca2edfeaa14afa168589f2b1f24bcce2a69230b284d6"
      },
      {
        "id": "qa-media-artifact-143",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/public/frame-002786.png",
        "sizeBytes": 3019439,
        "sha256": "defdd70e5700e00f17390eea83cd4dff42ff1a83f72517a2ac0b50dc8247494d"
      },
      {
        "id": "qa-media-artifact-144",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-07/public/frame-002787.png",
        "sizeBytes": 3017517,
        "sha256": "ce554c42d1d45cba53af7b33708ab453a23b0cfca45be25e87873796173c1c27"
      },
      {
        "id": "qa-media-artifact-145",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/proof/frame-005617.png",
        "sizeBytes": 712683,
        "sha256": "07b5cbc79eb90cc0f5f3dfaccd60721ae497d47540405f98f9be355656b006cc"
      },
      {
        "id": "qa-media-artifact-146",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/proof/frame-005618.png",
        "sizeBytes": 900058,
        "sha256": "7b3ff2de2d5ea780023b80f41c840a84a53d06a27e6a268d7877b8154f62ac9d"
      },
      {
        "id": "qa-media-artifact-147",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/proof/frame-005619.png",
        "sizeBytes": 900684,
        "sha256": "63cf9e4761cb82c5211011e0adc15df8b6b1fbb2b7b371dd33b04a58ff670154"
      },
      {
        "id": "qa-media-artifact-148",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/proof/frame-005620.png",
        "sizeBytes": 901850,
        "sha256": "1a798e1adc70e4493fc7ddec7c2a514111004b5d4ad8b6eab79ea79862084193"
      },
      {
        "id": "qa-media-artifact-149",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/proof/frame-005660.png",
        "sizeBytes": 755134,
        "sha256": "8c8e7f90fcadbcde6a0711e70f68fa224b1a76415d715b3a99010a16b2811838"
      },
      {
        "id": "qa-media-artifact-150",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/proof/frame-005661.png",
        "sizeBytes": 919482,
        "sha256": "78f87011c7f282260544ff720d19fd0dda5a6f6b4646260c034ecd3ed295442e"
      },
      {
        "id": "qa-media-artifact-151",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/proof/frame-005662.png",
        "sizeBytes": 923382,
        "sha256": "79eeecc5544fbead679adc6d9e371077bf7bed10668f4a991f9b80978ad20fe5"
      },
      {
        "id": "qa-media-artifact-152",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/proof/frame-005663.png",
        "sizeBytes": 930283,
        "sha256": "55f3d439de376a0902a139c11a1534dd4737773bd82396e9b9e1ff7b60c0ed4f"
      },
      {
        "id": "qa-media-artifact-153",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/proof/frame-005708.png",
        "sizeBytes": 756830,
        "sha256": "dbf7778bbb2d9948b1271b520898fc80320509e1a7269241e5b250a1fb09b0f6"
      },
      {
        "id": "qa-media-artifact-154",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/proof/frame-005709.png",
        "sizeBytes": 915190,
        "sha256": "5bea5d92a5891c688a58ff32fe3701aaf2352cb83e7cc20dea7b13f0f52d380b"
      },
      {
        "id": "qa-media-artifact-155",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/proof/frame-005710.png",
        "sizeBytes": 913619,
        "sha256": "a0bdeef278d663cb3a5f4af72a306ecbee5f3b286597401570fd6ea8c76b4a44"
      },
      {
        "id": "qa-media-artifact-156",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/proof/frame-005711.png",
        "sizeBytes": 913688,
        "sha256": "cc8a21ee717155f847453442826ba4fedd9b9dda5c9ba56037abb6e3dc1e9725"
      },
      {
        "id": "qa-media-artifact-157",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/public/frame-002808.png",
        "sizeBytes": 3087868,
        "sha256": "beae9c27ecbd7bcbcd763b6c6eb128151fd36ac1e341e59f7ae27b3b9e5923a8"
      },
      {
        "id": "qa-media-artifact-158",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/public/frame-002809.png",
        "sizeBytes": 3135754,
        "sha256": "acfc08e02cb634ba708db3ad726802febf40b22a1c3c8f03faeefeccc8a78ba8"
      },
      {
        "id": "qa-media-artifact-159",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/public/frame-002810.png",
        "sizeBytes": 3142301,
        "sha256": "1281a9877c4e164df0f086bcbc26200e5b303a8a2063d25f1a4d7d3d560eef85"
      },
      {
        "id": "qa-media-artifact-160",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/public/frame-002811.png",
        "sizeBytes": 3132035,
        "sha256": "a572fff12344f05433bbde45f8492a6248209fa3be62f324c136df9631458416"
      },
      {
        "id": "qa-media-artifact-161",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/public/frame-002830.png",
        "sizeBytes": 3335768,
        "sha256": "17c1c18ec69ff2a9b60dc60d805ab54ad0363f3d698ff1fc3b89654340437029"
      },
      {
        "id": "qa-media-artifact-162",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/public/frame-002831.png",
        "sizeBytes": 3370654,
        "sha256": "9c4fe8fc56361c9c9fc65fe19d6a92821d337e1585204d8241bd6791f3d43663"
      },
      {
        "id": "qa-media-artifact-163",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/public/frame-002832.png",
        "sizeBytes": 3371408,
        "sha256": "7a6d5c9ac4634458dc232b38cc63927667ccce31dc2212d07068e54c0f7edcb0"
      },
      {
        "id": "qa-media-artifact-164",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/public/frame-002833.png",
        "sizeBytes": 3377252,
        "sha256": "9834b26a470c22589aa1a54b31b9f01264c3865fafbd9c3eb26a4237ea16c3b1"
      },
      {
        "id": "qa-media-artifact-165",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/public/frame-002854.png",
        "sizeBytes": 3319766,
        "sha256": "d08bab167cbac42853f5436afc8aa1123703afc2d49073786dc2f376bf8134ef"
      },
      {
        "id": "qa-media-artifact-166",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/public/frame-002855.png",
        "sizeBytes": 3341106,
        "sha256": "8a66f20a3876ff23d9eadd60577f24da0580c27bdfa65876b25085bb47427fff"
      },
      {
        "id": "qa-media-artifact-167",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/public/frame-002856.png",
        "sizeBytes": 3352496,
        "sha256": "04e0cd827832f83c50f9adfd14130815d860c9fc8e74641f96afafbd412eaaf7"
      },
      {
        "id": "qa-media-artifact-168",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/c1-08/public/frame-002857.png",
        "sizeBytes": 3326863,
        "sha256": "65cdba125bca00bd8dda05df22576ad2e4681f32507c269af08ebdecdef2e693"
      },
      {
        "id": "qa-media-artifact-169",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008447.png",
        "sizeBytes": 760664,
        "sha256": "faac5902f146cbbaa5ef6d43db8d25a49733706888a5b1bf0131f56de637acf7"
      },
      {
        "id": "qa-media-artifact-170",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008448.png",
        "sizeBytes": 886014,
        "sha256": "9c8998a3ab26f9e7dab7ea0b2e4d1b47f1d8dc9cf6a7667437aebb6b21792938"
      },
      {
        "id": "qa-media-artifact-171",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008449.png",
        "sizeBytes": 900886,
        "sha256": "3e4b992cf7a3d312749495b7cb3ac69c93040ad3a329c5215c018220f8392597"
      },
      {
        "id": "qa-media-artifact-172",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008450.png",
        "sizeBytes": 900049,
        "sha256": "4aa7c913837a923eaa01d361338934863aae09fd331c16d7cab340183bd965ce"
      },
      {
        "id": "qa-media-artifact-173",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008635.png",
        "sizeBytes": 728140,
        "sha256": "806234d449449ec7da01f07a635d51498c62431de71790a0c76bee6456aeaffe"
      },
      {
        "id": "qa-media-artifact-174",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008636.png",
        "sizeBytes": 821394,
        "sha256": "7f59e3145e4a2fa5cc0035d6215007cb722af21c32cfbdd205b2c9e1713261d0"
      },
      {
        "id": "qa-media-artifact-175",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008637.png",
        "sizeBytes": 829683,
        "sha256": "25958001cca0d381bae1804396599c76eaf708cab452866258e5b3feb4b12880"
      },
      {
        "id": "qa-media-artifact-176",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008638.png",
        "sizeBytes": 829905,
        "sha256": "5470d340990cd512b4b2675e4a52465136fda742a12c367d587ff868bfd1d703"
      },
      {
        "id": "qa-media-artifact-177",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008709.png",
        "sizeBytes": 712847,
        "sha256": "c00b93f46a6203eac90c16b40b410859f366d1d861d82cfadb7e20bd46320156"
      },
      {
        "id": "qa-media-artifact-178",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008710.png",
        "sizeBytes": 839747,
        "sha256": "bcaf3c370f48d85450e6cb52e9e1853441b64e15e5a9574c78973c47fc5ad651"
      },
      {
        "id": "qa-media-artifact-179",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008711.png",
        "sizeBytes": 842488,
        "sha256": "0bb9ec92de7cdc8f5c4f68df25e4e53fe450626543e7500909c1b6b8f359e9bb"
      },
      {
        "id": "qa-media-artifact-180",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008712.png",
        "sizeBytes": 844011,
        "sha256": "6342600daf8abd2dc4fdb74955ba2cf6da7802c1e201626d48f1010a13f39a26"
      },
      {
        "id": "qa-media-artifact-181",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004223.png",
        "sizeBytes": 3368108,
        "sha256": "1960819a97b530c6cc490a5b7933399e57ff7049e9c73093ff7a1cc8fc723762"
      },
      {
        "id": "qa-media-artifact-182",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004225.png",
        "sizeBytes": 3453707,
        "sha256": "df5413af4e16ffcb2c754d3ffb8a1ee31bc83cd53314f5aa1e822a04e2718a37"
      },
      {
        "id": "qa-media-artifact-183",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004226.png",
        "sizeBytes": 3451852,
        "sha256": "bbfcccb863eea73b64761b76d8569505f91dbd88ddf5afe9c6c357f51a475d5a"
      },
      {
        "id": "qa-media-artifact-184",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004317.png",
        "sizeBytes": 3074334,
        "sha256": "52041489f870d5d1bb759150da1e6a894cc8bcf61097dc0c55b0c39de235a7bc"
      },
      {
        "id": "qa-media-artifact-185",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004318.png",
        "sizeBytes": 3076250,
        "sha256": "dec5c17f74e15c317309a6991b78aad2206706b85b8772bde55ffc91b19ac5f6"
      },
      {
        "id": "qa-media-artifact-186",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004319.png",
        "sizeBytes": 3077102,
        "sha256": "cb2fc835a4853510c5469d5d422260d5f784f6484592af663965763ed29df6b9"
      },
      {
        "id": "qa-media-artifact-187",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004320.png",
        "sizeBytes": 3084239,
        "sha256": "09e4b2ec932a2cb9fb5a10ad4d2851c448cc1f1c020732e458432a5a1b5492c4"
      },
      {
        "id": "qa-media-artifact-188",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004354.png",
        "sizeBytes": 3066478,
        "sha256": "e294e9b26a52e37779bbbd9faa1342406ace747848c3de23370a91b6b2a59a30"
      },
      {
        "id": "qa-media-artifact-189",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004355.png",
        "sizeBytes": 3073586,
        "sha256": "e34bc9a39cf8ed361b00c2848482c2110a2e84a05d08ff3ab52fc5b11afceb4f"
      },
      {
        "id": "qa-media-artifact-190",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004356.png",
        "sizeBytes": 3082974,
        "sha256": "1b67795c86abba4a678762be5e9656d5f673e5a1f813146b6cfcdc2538675780"
      },
      {
        "id": "qa-media-artifact-191",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004357.png",
        "sizeBytes": 3091495,
        "sha256": "95230a40a3c7cb01490f9a34a1f7e553b479e29ca2b193cdc7e4404136502456"
      },
      {
        "id": "qa-media-artifact-192",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010359.png",
        "sizeBytes": 755963,
        "sha256": "3ed1d4c1c6959cf17b58583ed0430e37840c3cefe55d3657302a0af8eafa8d80"
      },
      {
        "id": "qa-media-artifact-193",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010360.png",
        "sizeBytes": 815954,
        "sha256": "8bdeb18bf0ff42eda48dc8e81b99cc844deb87141cb014eddc77506c6d847a5d"
      },
      {
        "id": "qa-media-artifact-194",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010361.png",
        "sizeBytes": 822959,
        "sha256": "2b4d0bbe98f4da2292bec55781a1cfc27ebe4ba804b4a2f4b6bc87b42427134f"
      },
      {
        "id": "qa-media-artifact-195",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010362.png",
        "sizeBytes": 824127,
        "sha256": "83116405fcce113afb2dee1050a2ef3f1dc496f94e50e765dc4dba314ccfbffd"
      },
      {
        "id": "qa-media-artifact-196",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010392.png",
        "sizeBytes": 716790,
        "sha256": "d1477f55c8a16bf496f16aef77c2967c5a60a2c2fe468cb2952e736172853d1a"
      },
      {
        "id": "qa-media-artifact-197",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010393.png",
        "sizeBytes": 872123,
        "sha256": "e722cf75e41b13ae9ec1c8a1a545d06b6228b4120639370c017c8b989deeb4bb"
      },
      {
        "id": "qa-media-artifact-198",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010394.png",
        "sizeBytes": 872583,
        "sha256": "6a866826efca3a85edd068b0cc7f7abe2373cf767d84f6504c0cf1726a1ffc12"
      },
      {
        "id": "qa-media-artifact-199",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010395.png",
        "sizeBytes": 870671,
        "sha256": "5cde8ef37216dd0a9438db556c256577f0fa8d5129aeba11283c86b0efff1ae0"
      },
      {
        "id": "qa-media-artifact-200",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010529.png",
        "sizeBytes": 727374,
        "sha256": "76d0b5be3109546a316a4bac73690dbd07e3442f404c3145c92b5a1ed284bc65"
      },
      {
        "id": "qa-media-artifact-201",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010530.png",
        "sizeBytes": 838646,
        "sha256": "dfe5975dff06da9d6971ca52f98319299ee6c327d40c976a5bd1974c270bf708"
      },
      {
        "id": "qa-media-artifact-202",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010531.png",
        "sizeBytes": 852336,
        "sha256": "c6e684fbb22f515da790751954c00089e6bfd2b96cd6a72db47fe9e59d3e3528"
      },
      {
        "id": "qa-media-artifact-203",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010532.png",
        "sizeBytes": 851558,
        "sha256": "456fba29b4cc3d23c7efb96bd43b6e40a684ea5f8e41908e3b4e6962cd70661b"
      },
      {
        "id": "qa-media-artifact-204",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010645.png",
        "sizeBytes": 724461,
        "sha256": "54f3eb245ddd1b1fd2a3aa84a40f98d333084560b8911306bc5faee3a0eb9f0a"
      },
      {
        "id": "qa-media-artifact-205",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010646.png",
        "sizeBytes": 848643,
        "sha256": "81c25232581e4c2d0a7c6c0e1a6e65935942a4d1cc3977ae7655a7a24694bc4b"
      },
      {
        "id": "qa-media-artifact-206",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010647.png",
        "sizeBytes": 844730,
        "sha256": "f4b9012144cfb48b125eeae17e056f9eda39a13e6d8269455220d6a7781191b5"
      },
      {
        "id": "qa-media-artifact-207",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010648.png",
        "sizeBytes": 847063,
        "sha256": "80c74ebaa57966adee0bfc412350addc3f9186dc2811a2b828848ca1b86b9870"
      },
      {
        "id": "qa-media-artifact-208",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005179.png",
        "sizeBytes": 3210548,
        "sha256": "b5703c88b9e9823965e7b91876afefd4206c85dd9901cb7f5a990ea4b26f6c32"
      },
      {
        "id": "qa-media-artifact-209",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005180.png",
        "sizeBytes": 3214391,
        "sha256": "3c76e04de463d891351e197ad5814819bfcdd45b944573541ed693bc32e2db4f"
      },
      {
        "id": "qa-media-artifact-210",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005181.png",
        "sizeBytes": 3220884,
        "sha256": "7c5dbf27c6d25f0bd2d940527ae189dffa2f3d5cafaef8b69060c23a501704b5"
      },
      {
        "id": "qa-media-artifact-211",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005182.png",
        "sizeBytes": 3229777,
        "sha256": "cc7277dcf2f77b240321d8291cf473942a513df365adc4e066ded7dd5765ff6b"
      },
      {
        "id": "qa-media-artifact-212",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005196.png",
        "sizeBytes": 3220313,
        "sha256": "25902b337bb63b509c441dbdf5dc6c696428bd01bcd12216ad4f29e8f5855a39"
      },
      {
        "id": "qa-media-artifact-213",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005197.png",
        "sizeBytes": 3236950,
        "sha256": "b4ee2f1a6c4af5d96d96643778cdbaffd4564a5690404be67d7f937852278b17"
      },
      {
        "id": "qa-media-artifact-214",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005198.png",
        "sizeBytes": 3235456,
        "sha256": "c42814bf39b7ab9c4b1a9efd3a106272696bc30300d17aba8fde45dc5fbe4639"
      },
      {
        "id": "qa-media-artifact-215",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005199.png",
        "sizeBytes": 3231830,
        "sha256": "3ebf1006825a990995f056ac0640d016c6d817505213622f6e6466bd8854dfaf"
      },
      {
        "id": "qa-media-artifact-216",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005264.png",
        "sizeBytes": 3024045,
        "sha256": "d10cdcc5c380ef7835cd04debf0bec7d36ff7db1455e5e1f74bce68f7cc9737c"
      },
      {
        "id": "qa-media-artifact-217",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005265.png",
        "sizeBytes": 3043588,
        "sha256": "91d6294a66c4411636a352d26676eae891f725e54cf00dfcf418efb9415202d8"
      },
      {
        "id": "qa-media-artifact-218",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005266.png",
        "sizeBytes": 3046441,
        "sha256": "5b82463b4504f809cb1d1954d00cda703fa0d31c056da18ec6609a7ca654a26b"
      },
      {
        "id": "qa-media-artifact-219",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005267.png",
        "sizeBytes": 3042363,
        "sha256": "7ad36700f748730ad922ca938f431d0890bca25ba505bf74c73f0140e9fd9ee9"
      },
      {
        "id": "qa-media-artifact-220",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005322.png",
        "sizeBytes": 3157005,
        "sha256": "d2787bab338c7df974df1bbcb4d7cf32a3f54eb3b05805472c47ec5e7b044f7d"
      },
      {
        "id": "qa-media-artifact-221",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005323.png",
        "sizeBytes": 3156164,
        "sha256": "fea4f874ef99879a4055ddcaa1843f24ba33a8c086a3945cfd27099aa17ce737"
      },
      {
        "id": "qa-media-artifact-222",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005324.png",
        "sizeBytes": 3162076,
        "sha256": "93b47baed1388c3f8952ebfbf0265c60fa6f4999bf0ff2b38f0b682f7b804277"
      },
      {
        "id": "qa-media-artifact-223",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005325.png",
        "sizeBytes": 3164051,
        "sha256": "39c2d82b17cb023b80f04fbc0806f35b758856cc4a209795b7bee8c5b331c22d"
      },
      {
        "id": "qa-media-artifact-224",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/release-sheets/c1-06-proof.png",
        "sizeBytes": 1631963,
        "sha256": "a173b9dcfd116fce368ff90e51da13544104c15bbba60c6fcec5dc4413097d04"
      },
      {
        "id": "qa-media-artifact-225",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/release-sheets/c1-06-public.png",
        "sizeBytes": 1261156,
        "sha256": "00185e7b9cb879bd6e5d84c64d1b501f68fc14f6da322751ad1d9bba43823588"
      },
      {
        "id": "qa-media-artifact-226",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/release-sheets/c1-07-proof.png",
        "sizeBytes": 1796230,
        "sha256": "963802ad7d90b82b6d487dd7ff19308c72303bee4ce0de8ed5d80bd4279fb675"
      },
      {
        "id": "qa-media-artifact-227",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/release-sheets/c1-07-public.png",
        "sizeBytes": 1408730,
        "sha256": "aba668a4ee3de241ee91c8fcad74343939c8caa50426c15d18dfdec190d67488"
      },
      {
        "id": "qa-media-artifact-228",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/release-sheets/c1-08-proof.png",
        "sizeBytes": 1981252,
        "sha256": "6fe28e234b42ae07254caaae4fc34e5e209702242c6eb7b92112e232cbdd17e8"
      },
      {
        "id": "qa-media-artifact-229",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/release-sheets/c1-08-public.png",
        "sizeBytes": 1604186,
        "sha256": "179255aa79e20318916b721c8724bd990bd526785745cd4d1c48d39e9c62ca7a"
      },
      {
        "id": "qa-media-artifact-230",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/proof/frame-004937.png",
        "sizeBytes": 852401,
        "sha256": "5ca1e16d7dc9fa813bc4294e0760678587ce2a69532dab108f14ba5b1754b83f"
      },
      {
        "id": "qa-media-artifact-231",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/proof/frame-004938.png",
        "sizeBytes": 698930,
        "sha256": "bced5cac448e31a28e7b466f9aaf543a64a89b9a84711cc821d20f06516cf827"
      },
      {
        "id": "qa-media-artifact-232",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/proof/frame-004939.png",
        "sizeBytes": 700551,
        "sha256": "f4bb334ee1334364ffede69912e2779402ec3b20fa9e6b82c0b04e05e275db74"
      },
      {
        "id": "qa-media-artifact-233",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/proof/frame-004940.png",
        "sizeBytes": 699788,
        "sha256": "fa61f16dad6b59e7eded04a0890fc93a27e29a5a4474699642a1770b2a9df3f6"
      },
      {
        "id": "qa-media-artifact-234",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/proof/frame-005254.png",
        "sizeBytes": 881948,
        "sha256": "8e2bb9a9d937c2d602202d141efc4a6c6255fc9f8ea495965f27cc06ec2222fd"
      },
      {
        "id": "qa-media-artifact-235",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/proof/frame-005255.png",
        "sizeBytes": 711429,
        "sha256": "5268c4d0547f70507edd3623f246ce086390d930d67e765be398ae6f3defc8fb"
      },
      {
        "id": "qa-media-artifact-236",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/proof/frame-005256.png",
        "sizeBytes": 714195,
        "sha256": "bca4279713290144b4d7d71da491eab54dea61c718661b60c29594611a5a78d5"
      },
      {
        "id": "qa-media-artifact-237",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/proof/frame-005257.png",
        "sizeBytes": 716235,
        "sha256": "a3a76eec63d64a5642797817ddd81c699f983e67f709aeb6692966e0778702f7"
      },
      {
        "id": "qa-media-artifact-238",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/proof/frame-005365.png",
        "sizeBytes": 885197,
        "sha256": "52c64f9afd0bbf4d462fb4ad6b83bc76774bdd8f94633fd2c5a81eebfe9215c5"
      },
      {
        "id": "qa-media-artifact-239",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/proof/frame-005366.png",
        "sizeBytes": 724160,
        "sha256": "f4f939e665c56e11795f2d079e4636b7b9d0264315e3ba700e84a0d399a49d8d"
      },
      {
        "id": "qa-media-artifact-240",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/proof/frame-005367.png",
        "sizeBytes": 729816,
        "sha256": "2ae422b6a0a391d9543d041b3957c03a08c5167ec44a7dc90a14f59026cccf3f"
      },
      {
        "id": "qa-media-artifact-241",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/proof/frame-005368.png",
        "sizeBytes": 732394,
        "sha256": "9ae72e342ee0a71c2620d87d590368a519d6252531c0ce73c8bb5cd670640e8a"
      },
      {
        "id": "qa-media-artifact-242",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/public/frame-002468.png",
        "sizeBytes": 3285348,
        "sha256": "9bed75ef0caa103eacb4c59bafd26e42ae6366fe3f6d2a506848b3a28e3a4144"
      },
      {
        "id": "qa-media-artifact-243",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/public/frame-002469.png",
        "sizeBytes": 3286096,
        "sha256": "206b6e95abb4aa4f9ede2488edb9be13c378610f05d9439cea9487a2bcc31590"
      },
      {
        "id": "qa-media-artifact-244",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/public/frame-002470.png",
        "sizeBytes": 3286827,
        "sha256": "f0f982f6041d99beb4648c105f0d0fb193499252adfa5b3c05a4e14308516372"
      },
      {
        "id": "qa-media-artifact-245",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/public/frame-002471.png",
        "sizeBytes": 3286019,
        "sha256": "81a51d9b454357197fa5ab62974309e5de1d6a5e90515b1d88bd2b233c6e6ff8"
      },
      {
        "id": "qa-media-artifact-246",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/public/frame-002627.png",
        "sizeBytes": 3200289,
        "sha256": "869718f1245fe5d3bc7014c7340e42ff00b583ecc4c64bad4e5de1ac905c8db0"
      },
      {
        "id": "qa-media-artifact-247",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/public/frame-002628.png",
        "sizeBytes": 3195166,
        "sha256": "0cbd79fc31c46054b67b2ad63f7cf6ecb4e661143ad214c6cf8a0e6f01425da2"
      },
      {
        "id": "qa-media-artifact-248",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/public/frame-002629.png",
        "sizeBytes": 3192631,
        "sha256": "6a9c11f19ef44f44a3c677fc32b892e99411c9d973c3c9fbae0152ef97868e30"
      },
      {
        "id": "qa-media-artifact-249",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/public/frame-002630.png",
        "sizeBytes": 3195096,
        "sha256": "6f88a0ed87f857cfd9d881727e8dfa710e54a8441ff5440ef21c2eddf5bf4af4"
      },
      {
        "id": "qa-media-artifact-250",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/public/frame-002682.png",
        "sizeBytes": 3197180,
        "sha256": "e02abeda793d25a6a6cc6d9b92b1549c5175486278e617cf1ac7c4bd1c1f74fe"
      },
      {
        "id": "qa-media-artifact-251",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/public/frame-002683.png",
        "sizeBytes": 3228011,
        "sha256": "b6a092008d8c1a4516de5e4804aa46d7eb50d5ab460d957e20a1e8d6402fb0a3"
      },
      {
        "id": "qa-media-artifact-252",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/public/frame-002684.png",
        "sizeBytes": 3233376,
        "sha256": "cc51888a6116c3058017eecf0994081640a3cd32a8b581c5dd0b2c8382f3972f"
      },
      {
        "id": "qa-media-artifact-253",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-06/public/frame-002685.png",
        "sizeBytes": 3234680,
        "sha256": "5e3e0a3a0c2e3c1040a8d0dda6ac42f5ce5d077d754b17244c5ab4b5c95f3aac"
      },
      {
        "id": "qa-media-artifact-254",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/proof/frame-005475.png",
        "sizeBytes": 907371,
        "sha256": "d06c3c4c39e17b25359ab96c104eb309945d7680212d8727496cd6edc339aa20"
      },
      {
        "id": "qa-media-artifact-255",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/proof/frame-005476.png",
        "sizeBytes": 728745,
        "sha256": "c3425a3f5664b34aafd9f52b2bbe1200168fc8310e3bd1fb7b479edae1993696"
      },
      {
        "id": "qa-media-artifact-256",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/proof/frame-005477.png",
        "sizeBytes": 722889,
        "sha256": "34121fbf012126a14218f3fbbc8361febe350fc19586415e5a03aed794d51bc9"
      },
      {
        "id": "qa-media-artifact-257",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/proof/frame-005478.png",
        "sizeBytes": 891492,
        "sha256": "cc4563ac667af49c85be1dbeb732aedb18ff7b6b64feb69ef4d0ca66b17d4d59"
      },
      {
        "id": "qa-media-artifact-258",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/proof/frame-005566.png",
        "sizeBytes": 896940,
        "sha256": "5ddf6bb3e5170113298ab0dff7acb533563d498f72324899527f907f479e29a9"
      },
      {
        "id": "qa-media-artifact-259",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/proof/frame-005567.png",
        "sizeBytes": 731624,
        "sha256": "48cdeaf3e7de13e0d942c8aea2bf74b8d02eb62cd84f7f348052302d39be2db3"
      },
      {
        "id": "qa-media-artifact-260",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/proof/frame-005568.png",
        "sizeBytes": 733221,
        "sha256": "5516f3facb2d55756bb2c6ed8307d754fb33266d592ac6152764f0da12e3c9f8"
      },
      {
        "id": "qa-media-artifact-261",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/proof/frame-005569.png",
        "sizeBytes": 733435,
        "sha256": "80b76fe5ed176478d0e31f928d05ff7895546635ce5a5e03213c999f2f532635"
      },
      {
        "id": "qa-media-artifact-262",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/proof/frame-005614.png",
        "sizeBytes": 883894,
        "sha256": "a8da04c7cf6efe18cbc7afb852701b2b2c877290b431de4a19b6dedda7b3db4f"
      },
      {
        "id": "qa-media-artifact-263",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/proof/frame-005615.png",
        "sizeBytes": 710800,
        "sha256": "952358decf9702cfb9ab142e6a529fb5b015751921922d0aa873c2456e1636da"
      },
      {
        "id": "qa-media-artifact-264",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/proof/frame-005616.png",
        "sizeBytes": 711971,
        "sha256": "6d2383fc32a5f1c5e4b4c2610934f6e8a8fc0b1e047c6956ac571919e037a345"
      },
      {
        "id": "qa-media-artifact-265",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/proof/frame-005617.png",
        "sizeBytes": 712683,
        "sha256": "07b5cbc79eb90cc0f5f3dfaccd60721ae497d47540405f98f9be355656b006cc"
      },
      {
        "id": "qa-media-artifact-266",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/public/frame-002737.png",
        "sizeBytes": 3309459,
        "sha256": "df847717f156c452293780dc5c571ad4131d0150aa37f7bcd14329dfb154205a"
      },
      {
        "id": "qa-media-artifact-267",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/public/frame-002738.png",
        "sizeBytes": 3324252,
        "sha256": "e624bc8ea82fcf5e57190084da1b23d48f023829c8fe828494e657c1e13113aa"
      },
      {
        "id": "qa-media-artifact-268",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/public/frame-002739.png",
        "sizeBytes": 3292615,
        "sha256": "8782d2b3809181ffe0b35195eb50faedf3cab58f4ba4632c6f1a2095fe35b58b"
      },
      {
        "id": "qa-media-artifact-269",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/public/frame-002740.png",
        "sizeBytes": 3291207,
        "sha256": "3f0ef22a36ebfeda464e9ea0343cad9b8ad8fc8d138600fa26bfe224e1b77d9e"
      },
      {
        "id": "qa-media-artifact-270",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/public/frame-002783.png",
        "sizeBytes": 2980451,
        "sha256": "2b857abbd19b2fc164041d163d4f6f8eb2b1be66325754453ae387d976c23079"
      },
      {
        "id": "qa-media-artifact-271",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/public/frame-002784.png",
        "sizeBytes": 2989632,
        "sha256": "93b9f846a4ffd3cf406dc3fce05942a365d430c2def852b57e7a7bd764828004"
      },
      {
        "id": "qa-media-artifact-272",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/public/frame-002785.png",
        "sizeBytes": 3016451,
        "sha256": "331d5c4b4b2f1b573e0bca2edfeaa14afa168589f2b1f24bcce2a69230b284d6"
      },
      {
        "id": "qa-media-artifact-273",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/public/frame-002786.png",
        "sizeBytes": 3019439,
        "sha256": "defdd70e5700e00f17390eea83cd4dff42ff1a83f72517a2ac0b50dc8247494d"
      },
      {
        "id": "qa-media-artifact-274",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/public/frame-002807.png",
        "sizeBytes": 3081072,
        "sha256": "dad1538057c5bec63669fbfbec2a467fa483a212ca09b6956980107f44c8a37e"
      },
      {
        "id": "qa-media-artifact-275",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/public/frame-002808.png",
        "sizeBytes": 3087868,
        "sha256": "beae9c27ecbd7bcbcd763b6c6eb128151fd36ac1e341e59f7ae27b3b9e5923a8"
      },
      {
        "id": "qa-media-artifact-276",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/public/frame-002809.png",
        "sizeBytes": 3135754,
        "sha256": "acfc08e02cb634ba708db3ad726802febf40b22a1c3c8f03faeefeccc8a78ba8"
      },
      {
        "id": "qa-media-artifact-277",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-07/public/frame-002810.png",
        "sizeBytes": 3142301,
        "sha256": "1281a9877c4e164df0f086bcbc26200e5b303a8a2063d25f1a4d7d3d560eef85"
      },
      {
        "id": "qa-media-artifact-278",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/proof/frame-005655.png",
        "sizeBytes": 927350,
        "sha256": "4d81038597539a063e7294b1db929a4fc2d4350d3d12c2121be877e9edfa610d"
      },
      {
        "id": "qa-media-artifact-279",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/proof/frame-005656.png",
        "sizeBytes": 749687,
        "sha256": "e09dc2b41c57e2b55a21c65d2c6ba7f4ebce1b415ec27c63a28c6bfbb57bbdba"
      },
      {
        "id": "qa-media-artifact-280",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/proof/frame-005657.png",
        "sizeBytes": 746916,
        "sha256": "8de6b3f85b94bea835f40915cb79c1bbb0c19dd00789f220e199af4f77657382"
      },
      {
        "id": "qa-media-artifact-281",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/proof/frame-005658.png",
        "sizeBytes": 750151,
        "sha256": "310c8d3555f6e40d12595e443de135adca5f680cd4cdf13df69aea59cd35e95a"
      },
      {
        "id": "qa-media-artifact-282",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/proof/frame-005703.png",
        "sizeBytes": 931664,
        "sha256": "da360aa157d9911f071daad4e95ac3a61b909aefd407e4e5c274ae55d57a41e6"
      },
      {
        "id": "qa-media-artifact-283",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/proof/frame-005704.png",
        "sizeBytes": 762525,
        "sha256": "e95a283306762e971a1d7e73f9e59f2c9db8d9481e0792f443e67d47ca4afee8"
      },
      {
        "id": "qa-media-artifact-284",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/proof/frame-005705.png",
        "sizeBytes": 756692,
        "sha256": "fe35b8525d56610161eaee48caaa9cb8059fecbae1e07c9861b3cea3e64c6c63"
      },
      {
        "id": "qa-media-artifact-285",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/proof/frame-005706.png",
        "sizeBytes": 759790,
        "sha256": "f0cb6e0be9c362c4c1db26f10555ac79a27ce4edfa5e7179edacdd2ac70f4cd2"
      },
      {
        "id": "qa-media-artifact-286",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/proof/frame-005908.png",
        "sizeBytes": 915583,
        "sha256": "d6a5eff49ac79590b6f9527f86023575b3fa3fb539ca0de408823d1ace0f39a0"
      },
      {
        "id": "qa-media-artifact-287",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/proof/frame-005909.png",
        "sizeBytes": 762314,
        "sha256": "cb469c87c0a56a761f14f8e373a3e9545dfefb7938490f8ff95f72219be8aa4b"
      },
      {
        "id": "qa-media-artifact-288",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/proof/frame-005910.png",
        "sizeBytes": 761297,
        "sha256": "65bcc27948601a6cb8341a6f80b001f158009de8bebdbcc277182d37bc0f0822"
      },
      {
        "id": "qa-media-artifact-289",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/proof/frame-005911.png",
        "sizeBytes": 758239,
        "sha256": "5d3115285a1fc56726209cb0b3b0ac2d122e446136d5a173f4e0fab36b5d9d28"
      },
      {
        "id": "qa-media-artifact-290",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/public/frame-002827.png",
        "sizeBytes": 3297577,
        "sha256": "114f0d29146273599545cf73af8c5ebaf860610c4e383dc31e721901316cdaa2"
      },
      {
        "id": "qa-media-artifact-291",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/public/frame-002828.png",
        "sizeBytes": 3300340,
        "sha256": "78380c4c2f8bcbc01fe84f282acc7767c158ca857ab015a649952ffe3d9c4914"
      },
      {
        "id": "qa-media-artifact-292",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/public/frame-002829.png",
        "sizeBytes": 3303768,
        "sha256": "12ab71a19ad100d3b5c41eac2bff9b5beb9c888e2be365c0a8db7acbb0b410ec"
      },
      {
        "id": "qa-media-artifact-293",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/public/frame-002830.png",
        "sizeBytes": 3335768,
        "sha256": "17c1c18ec69ff2a9b60dc60d805ab54ad0363f3d698ff1fc3b89654340437029"
      },
      {
        "id": "qa-media-artifact-294",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/public/frame-002851.png",
        "sizeBytes": 3321511,
        "sha256": "fb07ec84b2e4b8afe94f1ad255ab63fa3cd4ddd2c37b70a4b3e52dfcdafb9c4e"
      },
      {
        "id": "qa-media-artifact-295",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/public/frame-002852.png",
        "sizeBytes": 3313418,
        "sha256": "07d62e09853a10cd92b43524b9a0c21c63d1f3535ea7c7d81fb72a7c111cb762"
      },
      {
        "id": "qa-media-artifact-296",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/public/frame-002853.png",
        "sizeBytes": 3309699,
        "sha256": "60a00528991b5631761cf6718f5cde918a7dee5e93804af7df18b24530b18863"
      },
      {
        "id": "qa-media-artifact-297",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/public/frame-002854.png",
        "sizeBytes": 3319766,
        "sha256": "d08bab167cbac42853f5436afc8aa1123703afc2d49073786dc2f376bf8134ef"
      },
      {
        "id": "qa-media-artifact-298",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/public/frame-002953.png",
        "sizeBytes": 3354716,
        "sha256": "c70f4729637622dd0891de58d20aaf4c33d0f6e69baf7280081769c8bef0ab0c"
      },
      {
        "id": "qa-media-artifact-299",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/public/frame-002954.png",
        "sizeBytes": 3349596,
        "sha256": "acfa8957f92041d74aa4cdcfcc3c7719679708fa5811e0ef03bcc2437e76eb6d"
      },
      {
        "id": "qa-media-artifact-300",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/public/frame-002955.png",
        "sizeBytes": 3356407,
        "sha256": "35375d8c74ae10372a897fd372772b053ef8adcae952c808615316fcb82f07d7"
      },
      {
        "id": "qa-media-artifact-301",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/releases/c1-08/public/frame-002956.png",
        "sizeBytes": 3361251,
        "sha256": "e622e3def45067d919a4e3ec50564bdb92665ba685bcd8b26f1656699ce3ed1b"
      }
    ],
    "media": {
      "reference": {
        "artifactId": "reference-render",
        "fileSha256": {
          "value": "6029f9485afb2c72bee9ec324c5a37be993cce82dbe67c96d0f4fe7e71df6c97",
          "source": "sha256-file"
        },
        "video": {
          "codecName": "prores",
          "profile": "4444",
          "codecTag": "ap4h",
          "width": 2160,
          "height": 2160,
          "avgFrameRate": "60/1",
          "realFrameRate": "60/1",
          "decodedFrameCount": {
            "value": 9180,
            "source": "ffprobe-count_frames"
          },
          "pixelFormat": "yuv444p12le",
          "sampleAspectRatio": "1:1",
          "colorRange": "tv",
          "colorSpace": "bt709",
          "colorTransfer": "bt709",
          "colorPrimaries": "bt709",
          "startTime": "0.000000",
          "duration": "153.000000"
        },
        "container": {
          "duration": "153.000000"
        },
        "strictDecode": {
          "passed": true,
          "source": "ffmpeg-xerror-full-decode"
        }
      },
      "public": {
        "artifactId": "public-master",
        "fileSha256": {
          "value": "d00ec94c9649a5bf1ff794b48563535efcd4933147964440467c91e2751888a8",
          "source": "sha256-file"
        },
        "video": {
          "codecName": "hevc",
          "codecTag": "hvc1",
          "width": 1080,
          "height": 1080,
          "avgFrameRate": "60/1",
          "realFrameRate": "60/1",
          "decodedFrameCount": {
            "value": 9180,
            "source": "ffprobe-count_frames"
          },
          "pixelFormat": "yuv420p10le",
          "sampleAspectRatio": "1:1",
          "colorRange": "tv",
          "colorSpace": "bt709",
          "colorTransfer": "bt709",
          "colorPrimaries": "bt709",
          "startTime": "0.000000",
          "duration": "153.000000"
        },
        "audio": {
          "codecName": "aac",
          "sampleRate": "44100",
          "channels": 2,
          "channelLayout": "stereo",
          "timeBase": "1/44100",
          "startPts": 0,
          "startTime": "0.000000",
          "durationTs": 6747300,
          "duration": "153.000000",
          "packetCount": {
            "value": 6591,
            "source": "ffprobe-count_packets"
          },
          "packetStreamSha256": {
            "value": "9d2cc3b8f0bd51b1fe0e990cc0d6d5cbb52a76e1b872b56ada849915b3856b24",
            "source": "stream-copy-sha256"
          }
        },
        "sourceAudio": {
          "timeBase": "1/44100",
          "startPts": 0,
          "startTime": "0.000000",
          "durationTs": 6747300,
          "duration": "153.000000",
          "packetCount": {
            "value": 6591,
            "source": "ffprobe-count_packets"
          },
          "packetStreamSha256": {
            "value": "9d2cc3b8f0bd51b1fe0e990cc0d6d5cbb52a76e1b872b56ada849915b3856b24",
            "source": "stream-copy-sha256"
          }
        },
        "container": {
          "duration": "153.000000",
          "faststart": {
            "moovBeforeMdat": true,
            "source": "parsed-atom-order"
          }
        },
        "strictDecode": {
          "passed": true,
          "source": "ffmpeg-xerror-full-decode"
        }
      },
      "proof": {
        "artifactId": "sync-proof",
        "fileSha256": {
          "value": "edb93cfe0972ddbb8488b90a252289028f569a93b0f5a577b790625866d423ae",
          "source": "sha256-file"
        },
        "video": {
          "codecName": "h264",
          "codecTag": "avc1",
          "width": 1080,
          "height": 1080,
          "avgFrameRate": "120/1",
          "realFrameRate": "120/1",
          "decodedFrameCount": {
            "value": 18360,
            "source": "ffprobe-count_frames"
          },
          "pixelFormat": "yuv420p",
          "sampleAspectRatio": "1:1",
          "colorRange": "tv",
          "colorSpace": "bt709",
          "colorTransfer": "bt709",
          "colorPrimaries": "bt709",
          "startTime": "0.000000",
          "duration": "153.000000"
        },
        "audio": {
          "codecName": "aac",
          "sampleRate": "44100",
          "channels": 2,
          "channelLayout": "stereo",
          "timeBase": "1/44100",
          "startPts": 0,
          "startTime": "0.000000",
          "durationTs": 6747300,
          "duration": "153.000000",
          "packetCount": {
            "value": 6591,
            "source": "ffprobe-count_packets"
          },
          "packetStreamSha256": {
            "value": "9d2cc3b8f0bd51b1fe0e990cc0d6d5cbb52a76e1b872b56ada849915b3856b24",
            "source": "stream-copy-sha256"
          }
        },
        "sourceAudio": {
          "timeBase": "1/44100",
          "startPts": 0,
          "startTime": "0.000000",
          "durationTs": 6747300,
          "duration": "153.000000",
          "packetCount": {
            "value": 6591,
            "source": "ffprobe-count_packets"
          },
          "packetStreamSha256": {
            "value": "9d2cc3b8f0bd51b1fe0e990cc0d6d5cbb52a76e1b872b56ada849915b3856b24",
            "source": "stream-copy-sha256"
          }
        },
        "container": {
          "duration": "153.000000",
          "faststart": {
            "moovBeforeMdat": true,
            "source": "parsed-atom-order"
          }
        },
        "strictDecode": {
          "passed": true,
          "source": "ffmpeg-xerror-full-decode"
        }
      }
    },
    "qaCoverage": {
      "lineIds": [
        "C1-01",
        "C1-02",
        "C1-03",
        "C1-04",
        "C1-05",
        "C1-06",
        "C1-07",
        "C1-08",
        "V1-01",
        "V1-02",
        "V1-03",
        "V1-04",
        "V1-05",
        "V1-06",
        "V1-07",
        "V1-08",
        "C2-01",
        "C2-02",
        "C2-03",
        "C2-04",
        "C2-05",
        "C2-06",
        "C2-07",
        "C2-08"
      ],
      "speedVariants": [
        "normal",
        "half"
      ],
      "dedicatedRanges": [
        "v1-03",
        "v1-08",
        "chorus-1",
        "chorus-2",
        "first-act-40-50",
        "final-handoff"
      ],
      "proofRanges": [
        "v1-03",
        "v1-08"
      ],
      "cueIds": [
        "C1-04-C01",
        "C1-04-C02",
        "C1-04-C03",
        "C1-06-C01",
        "C1-06-C02",
        "C1-06-C03",
        "C1-07-C01",
        "C1-07-C02",
        "C1-07-C03",
        "C1-08-C01",
        "C1-08-C02",
        "C1-08-C03",
        "V1-03-C01",
        "V1-03-C02",
        "V1-03-C03",
        "V1-08-C01",
        "V1-08-C02",
        "V1-08-C03",
        "V1-08-C04"
      ],
      "contactOffsets": [
        -1,
        0,
        1,
        2
      ],
      "cadences": [
        60,
        120
      ],
      "stillPurposes": [
        "chrome",
        "handoff",
        "focus",
        "safe-area",
        "spectrum-peak",
        "backward-contact",
        "final-transition"
      ],
      "allArtifactsHashed": true,
      "mediaManifestArtifactId": "qa-media-manifest"
    },
    "requirementMatrix": {
      "criteria": [
        {
          "id": 1,
          "title": "Locked source audio authority",
          "status": "proved",
          "evidence": [
            {
              "id": "criterion-01-evidence-01",
              "kind": "source-audio",
              "artifact": "projects/tanisea-lyric-film/public/soundtrack.m4a",
              "sha256": "93084f293d491da1519732f3fa3cf6416c783d04e8ca18b5569c7608a8d4540d",
              "value": "criterion 1 verified"
            }
          ]
        },
        {
          "id": 2,
          "title": "Complete build and test verification",
          "status": "proved",
          "evidence": [
            {
              "id": "criterion-02-evidence-01",
              "kind": "test-result",
              "artifact": "projects/tanisea-lyric-film/work/qa/run-2/logs/check.log",
              "sha256": "dff722934a99c7bc79e1b06728cc7ad2082236ed989717eff8614fb16f23d852",
              "value": "criterion 2 verified"
            }
          ]
        },
        {
          "id": 3,
          "title": "Sample-indexed alignment authority",
          "status": "proved",
          "evidence": [
            {
              "id": "criterion-03-evidence-01",
              "kind": "alignment-manifest",
              "artifact": "projects/tanisea-lyric-film/alignment/tanisea-word-alignment-v3.json",
              "sha256": "06fe6c8d6ad4db5131ab4f9ab98be91ea87064fdeea58017c6b8c21ed8530f0b",
              "value": "criterion 3 verified"
            }
          ]
        },
        {
          "id": 4,
          "title": "Measured timing uncertainty bounds",
          "status": "proved",
          "evidence": [
            {
              "id": "criterion-04-evidence-01",
              "kind": "alignment-manifest",
              "artifact": "projects/tanisea-lyric-film/alignment/tanisea-word-alignment-v3.json",
              "sha256": "06fe6c8d6ad4db5131ab4f9ab98be91ea87064fdeea58017c6b8c21ed8530f0b",
              "value": "criterion 4 verified"
            }
          ]
        },
        {
          "id": 5,
          "title": "Reviewed semantic source-to-target mapping",
          "status": "proved",
          "evidence": [
            {
              "id": "criterion-05-evidence-01",
              "kind": "semantic-map",
              "artifact": "projects/tanisea-lyric-film/alignment/tanisea-word-alignment-v3.json",
              "sha256": "06fe6c8d6ad4db5131ab4f9ab98be91ea87064fdeea58017c6b8c21ed8530f0b",
              "value": "criterion 5 verified"
            }
          ]
        },
        {
          "id": 6,
          "title": "Backward activation and repeated-chorus semantics",
          "status": "proved",
          "evidence": [
            {
              "id": "criterion-06-evidence-01",
              "kind": "semantic-map",
              "artifact": "projects/tanisea-lyric-film/alignment/tanisea-word-alignment-v3.json",
              "sha256": "06fe6c8d6ad4db5131ab4f9ab98be91ea87064fdeea58017c6b8c21ed8530f0b",
              "value": "criterion 6 verified"
            }
          ]
        },
        {
          "id": 7,
          "title": "Public and proof cadence verification",
          "status": "proved",
          "evidence": [
            {
              "id": "criterion-07-evidence-01",
              "kind": "cadence-verification",
              "artifact": "projects/tanisea-lyric-film/work/qa/run-2/logs/verify-public.log",
              "sha256": "22cc14785f7493296920c407a3d84d1bfe1091c8553b7485218965fd1aa07820",
              "value": "public cadence verified"
            },
            {
              "id": "criterion-07-evidence-02",
              "kind": "cadence-verification",
              "artifact": "projects/tanisea-lyric-film/work/qa/run-2/logs/verify-proof.log",
              "sha256": "4170d792c559f583ac74e41e89f450e26a01fe19fe43176cf32be117a4b240dc",
              "value": "proof cadence verified"
            }
          ]
        },
        {
          "id": 8,
          "title": "Public chrome and upper-rail removal",
          "status": "proved",
          "evidence": [
            {
              "id": "criterion-08-evidence-01",
              "kind": "public-markup",
              "artifact": "projects/tanisea-lyric-film/work/qa/run-2/logs/verify-public-markup.log",
              "sha256": "479610e7cbdd0daa612376ec6253510c784aa002d523879246f95a0ef748a521",
              "value": "criterion 8 verified"
            },
            {
              "id": "criterion-08-evidence-02",
              "kind": "encoded-frame",
              "artifact": "projects/tanisea-lyric-film/work/qa/run-2/selected-frames/chrome.png",
              "sha256": "7bc33ab82b2ea4eaca2124b79ae6c268b45bd5c27dd8e8fd123361a41712750b",
              "value": "public chrome encoded frame verified"
            }
          ]
        },
        {
          "id": 9,
          "title": "Lyric, spectrum, and safe-area layout",
          "status": "proved",
          "evidence": [
            {
              "id": "criterion-09-evidence-01",
              "kind": "layout-verification",
              "artifact": "projects/tanisea-lyric-film/work/qa/run-2/logs/layout-verify.log",
              "sha256": "82ebc7828329999b62c52cb0c4342455759306963562599508b798dbe6392ae5",
              "value": "criterion 9 verified"
            },
            {
              "id": "criterion-09-evidence-02",
              "kind": "encoded-frame",
              "artifact": "projects/tanisea-lyric-film/work/qa/run-2/selected-frames/safe-area.png",
              "sha256": "ea32e5a02a499b96e0e650e3355ebb92c48ced226420477e6eefad9e7efdf2d4",
              "value": "public safe-area encoded frame verified"
            }
          ]
        },
        {
          "id": 10,
          "title": "Repeated QA with no unexplained drift",
          "status": "proved",
          "evidence": [
            {
              "id": "criterion-10-evidence-01",
              "kind": "qa-run-comparison",
              "artifact": "projects/tanisea-lyric-film/work/qa/run-2/run-comparison.json",
              "sha256": "2c0d5fe5e46d565263caa2d15bee3bc81fc1fa0e738dcae973d9f4c571b754ed",
              "value": "criterion 10 verified"
            }
          ]
        },
        {
          "id": 11,
          "title": "Release assets and documentation readiness",
          "status": "pending-publication",
          "evidence": [
            {
              "id": "criterion-11-evidence-01",
              "kind": "publication-readiness",
              "artifact": "projects/tanisea-lyric-film/output/Tanisea-Lyric-Film-vNext-60fps-Archival-Master.mp4",
              "sha256": "d00ec94c9649a5bf1ff794b48563535efcd4933147964440467c91e2751888a8",
              "value": "criterion 11 publication readiness verified locally"
            }
          ]
        }
      ]
    },
    "selectedFrames": [
      {
        "id": "chrome",
        "artifactId": "public-chrome-still",
        "composition": "LyricFilmVNext",
        "frame": 3844,
        "path": "projects/tanisea-lyric-film/work/qa/run-2/selected-frames/chrome.png",
        "sha256": "7bc33ab82b2ea4eaca2124b79ae6c268b45bd5c27dd8e8fd123361a41712750b"
      },
      {
        "id": "handoff",
        "artifactId": "public-handoff-still",
        "composition": "LyricFilmVNext",
        "frame": 7079,
        "path": "projects/tanisea-lyric-film/work/qa/run-2/selected-frames/handoff.png",
        "sha256": "209b0b54574f535ec4bc77ac1123604fbfc7f40ef573eba27ff45b69f4f5b641"
      },
      {
        "id": "focus",
        "artifactId": "public-focus-still",
        "composition": "LyricFilmVNext",
        "frame": 4355,
        "path": "projects/tanisea-lyric-film/work/qa/run-2/selected-frames/focus.png",
        "sha256": "e34bc9a39cf8ed361b00c2848482c2110a2e84a05d08ff3ab52fc5b11afceb4f"
      },
      {
        "id": "safe-area",
        "artifactId": "public-safe-area-still",
        "composition": "LyricFilmVNext",
        "frame": 4458,
        "path": "projects/tanisea-lyric-film/work/qa/run-2/selected-frames/safe-area.png",
        "sha256": "ea32e5a02a499b96e0e650e3355ebb92c48ced226420477e6eefad9e7efdf2d4"
      },
      {
        "id": "spectrum-peak",
        "artifactId": "public-spectrum-peak-still",
        "composition": "LyricFilmVNext",
        "frame": 2306,
        "path": "projects/tanisea-lyric-film/work/qa/run-2/selected-frames/spectrum-peak.png",
        "sha256": "d85992dd0f5bc8d88c9774fd1e3ade74c9eb2f4406fb2240d6bc541e3f64d038"
      },
      {
        "id": "backward-contact",
        "artifactId": "proof-backward-contact-still",
        "composition": "LyricFilmSyncProof",
        "frame": 10394,
        "path": "projects/tanisea-lyric-film/work/qa/run-2/selected-frames/backward-contact.png",
        "sha256": "6a866826efca3a85edd068b0cc7f7abe2373cf767d84f6504c0cf1726a1ffc12"
      },
      {
        "id": "final-transition",
        "artifactId": "reference-transition-still",
        "composition": "LyricFilmVNext",
        "frame": 7092,
        "path": "projects/tanisea-lyric-film/work/qa/run-2/selected-frames/final-transition.png",
        "sha256": "55209e993283bc807d5b3ac7928f6dac667ff1a607bfacc2dafefbe9c45b2b71"
      }
    ]
  },
  "sourceSummary": {
    "artifactId": "source-audio",
    "sha256": "93084f293d491da1519732f3fa3cf6416c783d04e8ca18b5569c7608a8d4540d",
    "sampleRateHz": 44100,
    "channels": 2,
    "channelLayout": "stereo",
    "publicDurationSeconds": 153,
    "decodedSamplesPerChannel": 6747584,
    "retainedAnalysisDurationSeconds": 153.00644
  },
  "alignmentSummary": {
    "artifactId": "alignment-manifest",
    "sha256": "06fe6c8d6ad4db5131ab4f9ab98be91ea87064fdeea58017c6b8c21ed8530f0b",
    "displayedLineCount": 24,
    "sourceTokenCount": 102,
    "cueReferencedSemanticSourceTokenCount": 101,
    "explicitlyUnmappedSourceTokenIds": [
      "V1-08-R01"
    ],
    "cueCount": 74,
    "targetActivationCount": 74,
    "chorusOccurrenceCount": 2,
    "literalChorusPairCount": 8,
    "maximumUncertainty": {
      "samples": 882,
      "milliseconds": 20
    },
    "observedMaximumFrameErrorMilliseconds": {
      "fps60": 8.321995,
      "fps120": 4.002268
    },
    "reviewedSemanticSequences": [
      {
        "lineId": "V1-03",
        "records": [
          {
            "cueId": "V1-03-C02",
            "startSample": 3173568,
            "sourceTokenIds": [
              "V1-03-R05"
            ],
            "targetSegmentIds": [
              "V1-03-S03"
            ],
            "activation": "forward"
          },
          {
            "cueId": "V1-03-C03",
            "startSample": 3200910,
            "sourceTokenIds": [
              "V1-03-R06"
            ],
            "targetSegmentIds": [
              "V1-03-S02"
            ],
            "activation": "backward"
          }
        ]
      },
      {
        "lineId": "V1-08",
        "records": [
          {
            "cueId": "V1-08-C01",
            "startSample": 3807197,
            "sourceTokenIds": [
              "V1-08-R02"
            ],
            "targetSegmentIds": [
              "V1-08-S02"
            ],
            "activation": "forward"
          },
          {
            "cueId": "V1-08-C02",
            "startSample": 3819545,
            "sourceTokenIds": [
              "V1-08-R03",
              "V1-08-R04"
            ],
            "targetSegmentIds": [
              "V1-08-S01"
            ],
            "activation": "backward"
          },
          {
            "cueId": "V1-08-C03",
            "startSample": 3869863,
            "sourceTokenIds": [
              "V1-08-R05",
              "V1-08-R06"
            ],
            "targetSegmentIds": [
              "V1-08-S03"
            ],
            "activation": "forward"
          },
          {
            "cueId": "V1-08-C04",
            "startSample": 3912243,
            "sourceTokenIds": [
              "V1-08-R07"
            ],
            "targetSegmentIds": [
              "V1-08-S04"
            ],
            "activation": "forward"
          }
        ]
      }
    ]
  },
  "featuresSummary": {
    "artifactId": "audio-features",
    "sha256": "c9453f8c6fb3de3f16e691b51b4155c5db7e313f5aac1cc7942904754d29b7cf"
  },
  "layoutSummary": {
    "spectrumBandCount": 64,
    "spectrumMeasuredCorePx": 96,
    "spectrumMaximumCapPx": 18,
    "minimumLyricGapPx": 36,
    "lowerChromeClearancePx": 11,
    "publicUpperTelemetryAbsent": true,
    "publicGlobalUpperRailAbsent": true
  },
  "qaCoverage": {
    "lineIds": [
      "C1-01",
      "C1-02",
      "C1-03",
      "C1-04",
      "C1-05",
      "C1-06",
      "C1-07",
      "C1-08",
      "V1-01",
      "V1-02",
      "V1-03",
      "V1-04",
      "V1-05",
      "V1-06",
      "V1-07",
      "V1-08",
      "C2-01",
      "C2-02",
      "C2-03",
      "C2-04",
      "C2-05",
      "C2-06",
      "C2-07",
      "C2-08"
    ],
    "speedVariants": [
      "normal",
      "half"
    ],
    "dedicatedRanges": [
      "v1-03",
      "v1-08",
      "chorus-1",
      "chorus-2",
      "first-act-40-50",
      "final-handoff"
    ],
    "proofRanges": [
      "v1-03",
      "v1-08"
    ],
    "cueIds": [
      "C1-04-C01",
      "C1-04-C02",
      "C1-04-C03",
      "C1-06-C01",
      "C1-06-C02",
      "C1-06-C03",
      "C1-07-C01",
      "C1-07-C02",
      "C1-07-C03",
      "C1-08-C01",
      "C1-08-C02",
      "C1-08-C03",
      "V1-03-C01",
      "V1-03-C02",
      "V1-03-C03",
      "V1-08-C01",
      "V1-08-C02",
      "V1-08-C03",
      "V1-08-C04"
    ],
    "contactOffsets": [
      -1,
      0,
      1,
      2
    ],
    "cadences": [
      60,
      120
    ],
    "stillPurposes": [
      "chrome",
      "handoff",
      "focus",
      "safe-area",
      "spectrum-peak",
      "backward-contact",
      "final-transition"
    ],
    "allArtifactsHashed": true,
    "mediaManifestArtifactId": "qa-media-manifest"
  },
  "media": {
    "reference": {
      "artifactId": "reference-render",
      "fileSha256": {
        "value": "6029f9485afb2c72bee9ec324c5a37be993cce82dbe67c96d0f4fe7e71df6c97",
        "source": "sha256-file"
      },
      "video": {
        "codecName": "prores",
        "profile": "4444",
        "codecTag": "ap4h",
        "width": 2160,
        "height": 2160,
        "avgFrameRate": "60/1",
        "realFrameRate": "60/1",
        "decodedFrameCount": {
          "value": 9180,
          "source": "ffprobe-count_frames"
        },
        "pixelFormat": "yuv444p12le",
        "sampleAspectRatio": "1:1",
        "colorRange": "tv",
        "colorSpace": "bt709",
        "colorTransfer": "bt709",
        "colorPrimaries": "bt709",
        "startTime": "0.000000",
        "duration": "153.000000"
      },
      "container": {
        "duration": "153.000000"
      },
      "strictDecode": {
        "passed": true,
        "source": "ffmpeg-xerror-full-decode"
      }
    },
    "public": {
      "artifactId": "public-master",
      "fileSha256": {
        "value": "d00ec94c9649a5bf1ff794b48563535efcd4933147964440467c91e2751888a8",
        "source": "sha256-file"
      },
      "video": {
        "codecName": "hevc",
        "codecTag": "hvc1",
        "width": 1080,
        "height": 1080,
        "avgFrameRate": "60/1",
        "realFrameRate": "60/1",
        "decodedFrameCount": {
          "value": 9180,
          "source": "ffprobe-count_frames"
        },
        "pixelFormat": "yuv420p10le",
        "sampleAspectRatio": "1:1",
        "colorRange": "tv",
        "colorSpace": "bt709",
        "colorTransfer": "bt709",
        "colorPrimaries": "bt709",
        "startTime": "0.000000",
        "duration": "153.000000"
      },
      "audio": {
        "codecName": "aac",
        "sampleRate": "44100",
        "channels": 2,
        "channelLayout": "stereo",
        "timeBase": "1/44100",
        "startPts": 0,
        "startTime": "0.000000",
        "durationTs": 6747300,
        "duration": "153.000000",
        "packetCount": {
          "value": 6591,
          "source": "ffprobe-count_packets"
        },
        "packetStreamSha256": {
          "value": "9d2cc3b8f0bd51b1fe0e990cc0d6d5cbb52a76e1b872b56ada849915b3856b24",
          "source": "stream-copy-sha256"
        }
      },
      "sourceAudio": {
        "timeBase": "1/44100",
        "startPts": 0,
        "startTime": "0.000000",
        "durationTs": 6747300,
        "duration": "153.000000",
        "packetCount": {
          "value": 6591,
          "source": "ffprobe-count_packets"
        },
        "packetStreamSha256": {
          "value": "9d2cc3b8f0bd51b1fe0e990cc0d6d5cbb52a76e1b872b56ada849915b3856b24",
          "source": "stream-copy-sha256"
        }
      },
      "container": {
        "duration": "153.000000",
        "faststart": {
          "moovBeforeMdat": true,
          "source": "parsed-atom-order"
        }
      },
      "strictDecode": {
        "passed": true,
        "source": "ffmpeg-xerror-full-decode"
      }
    },
    "proof": {
      "artifactId": "sync-proof",
      "fileSha256": {
        "value": "edb93cfe0972ddbb8488b90a252289028f569a93b0f5a577b790625866d423ae",
        "source": "sha256-file"
      },
      "video": {
        "codecName": "h264",
        "codecTag": "avc1",
        "width": 1080,
        "height": 1080,
        "avgFrameRate": "120/1",
        "realFrameRate": "120/1",
        "decodedFrameCount": {
          "value": 18360,
          "source": "ffprobe-count_frames"
        },
        "pixelFormat": "yuv420p",
        "sampleAspectRatio": "1:1",
        "colorRange": "tv",
        "colorSpace": "bt709",
        "colorTransfer": "bt709",
        "colorPrimaries": "bt709",
        "startTime": "0.000000",
        "duration": "153.000000"
      },
      "audio": {
        "codecName": "aac",
        "sampleRate": "44100",
        "channels": 2,
        "channelLayout": "stereo",
        "timeBase": "1/44100",
        "startPts": 0,
        "startTime": "0.000000",
        "durationTs": 6747300,
        "duration": "153.000000",
        "packetCount": {
          "value": 6591,
          "source": "ffprobe-count_packets"
        },
        "packetStreamSha256": {
          "value": "9d2cc3b8f0bd51b1fe0e990cc0d6d5cbb52a76e1b872b56ada849915b3856b24",
          "source": "stream-copy-sha256"
        }
      },
      "sourceAudio": {
        "timeBase": "1/44100",
        "startPts": 0,
        "startTime": "0.000000",
        "durationTs": 6747300,
        "duration": "153.000000",
        "packetCount": {
          "value": 6591,
          "source": "ffprobe-count_packets"
        },
        "packetStreamSha256": {
          "value": "9d2cc3b8f0bd51b1fe0e990cc0d6d5cbb52a76e1b872b56ada849915b3856b24",
          "source": "stream-copy-sha256"
        }
      },
      "container": {
        "duration": "153.000000",
        "faststart": {
          "moovBeforeMdat": true,
          "source": "parsed-atom-order"
        }
      },
      "strictDecode": {
        "passed": true,
        "source": "ffmpeg-xerror-full-decode"
      }
    }
  },
  "runReferences": [
    {
      "runId": "run-1",
      "path": "projects/tanisea-lyric-film/work/qa/run-1/qa-run.json",
      "sha256": "b8ac9492f2d15e459405d35a1cd33354e1bb0a27492d562217a9b3af8b2c0e02"
    },
    {
      "runId": "run-2",
      "path": "projects/tanisea-lyric-film/work/qa/run-2/qa-run.json",
      "sha256": "a477377b4f07997cffda9557e9aab3542d416cfa1ae61b9e60ee806c29dc5aed"
    }
  ],
  "comparison": {
    "matched": true,
    "authoritativeRunId": "run-2",
    "recordPath": "projects/tanisea-lyric-film/work/qa/run-2/run-comparison.json",
    "unexplainedDrift": [],
    "recordSha256": "2c0d5fe5e46d565263caa2d15bee3bc81fc1fa0e738dcae973d9f4c571b754ed"
  },
  "publication": {
    "sourceCommit": "5b0eef186e8e2ed5da2bfa0d88a5dd6625123a93",
    "tag": "v2.3.0",
    "releaseUrl": "https://github.com/ael-dev3/lyrics/releases/tag/v2.3.0",
    "checksumsUrl": "https://github.com/ael-dev3/lyrics/releases/download/v2.3.0/CHECKSUMS.sha256",
    "assets": [
      {
        "name": "Tanisea-Lyric-Film-Production-Master-vNext.mp4",
        "url": "https://github.com/ael-dev3/lyrics/releases/download/v2.3.0/Tanisea-Lyric-Film-Production-Master-vNext.mp4",
        "sizeBytes": 19499812,
        "sha256": "d00ec94c9649a5bf1ff794b48563535efcd4933147964440467c91e2751888a8"
      },
      {
        "name": "Tanisea-Lyric-Film-Sync-Proof-120fps.mp4",
        "url": "https://github.com/ael-dev3/lyrics/releases/download/v2.3.0/Tanisea-Lyric-Film-Sync-Proof-120fps.mp4",
        "sizeBytes": 158033925,
        "sha256": "edb93cfe0972ddbb8488b90a252289028f569a93b0f5a577b790625866d423ae"
      },
      {
        "name": "tanisea-vnext-hero.png",
        "url": "https://github.com/ael-dev3/lyrics/releases/download/v2.3.0/tanisea-vnext-hero.png",
        "sizeBytes": 3974608,
        "sha256": "5b8e4e43d2097166bf121ce43fcad32dc46370fdba62750403f4972b56790fd6"
      },
      {
        "name": "Tanisea-Lyric-Film-Source-vNext.zip",
        "url": "https://github.com/ael-dev3/lyrics/releases/download/v2.3.0/Tanisea-Lyric-Film-Source-vNext.zip",
        "sizeBytes": 5183256,
        "sha256": "8aec112bbf12eae1ac99a7074ec577ad4f9fb1d0c9955322d524508a0b3ec3fa"
      },
      {
        "name": "tanisea-word-alignment-v3.json",
        "url": "https://github.com/ael-dev3/lyrics/releases/download/v2.3.0/tanisea-word-alignment-v3.json",
        "sizeBytes": 351148,
        "sha256": "06fe6c8d6ad4db5131ab4f9ab98be91ea87064fdeea58017c6b8c21ed8530f0b"
      },
      {
        "name": "tanisea-word-alignment-v3.md",
        "url": "https://github.com/ael-dev3/lyrics/releases/download/v2.3.0/tanisea-word-alignment-v3.md",
        "sizeBytes": 41171,
        "sha256": "cc31fe40136cd2d2419808f39c1d48a065337bbaf8717b3af3ee7aaf74924e17"
      }
    ],
    "checksumVerification": {
      "algorithm": "SHA-256",
      "entryCount": 8,
      "result": "matched-after-download"
    }
  }
}
```
