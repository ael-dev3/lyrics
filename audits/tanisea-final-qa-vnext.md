# Tanisea final QA

Status and bounded claim are preserved in the embedded machine report.

```json
{
  "schemaVersion": 1,
  "status": "passed-prepublication",
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
            "sha256": "914c776eb531d16c4ed1686d2121ac2efd8a204608338108663634173191f03d",
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
            "sha256": "7a06e6251b38f97b161b4750149271611df157006140e528b98bf1ba9387262a",
            "value": "public cadence verified"
          },
          {
            "id": "criterion-07-evidence-02",
            "kind": "cadence-verification",
            "artifact": "projects/tanisea-lyric-film/work/qa/run-2/logs/verify-proof.log",
            "sha256": "279d857d568c66016a197048ad5a93c05cf483ce54b2dd8e55e8c7ff3256bc20",
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
            "sha256": "209b978d59ee5f0a1e0f658656de0fcd6ba1876d0486db0d843f2f1ba0f32f4f",
            "value": "criterion 8 verified"
          },
          {
            "id": "criterion-08-evidence-02",
            "kind": "encoded-frame",
            "artifact": "projects/tanisea-lyric-film/work/qa/run-2/selected-frames/chrome.png",
            "sha256": "6ba12eacae3662a70466c62cdf7689b3560c5e784a494c84354c8eb1d77b2706",
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
            "sha256": "d00022e371367289a8d29022e64fb141f08f629db300829fe23973315efcba40",
            "value": "criterion 9 verified"
          },
          {
            "id": "criterion-09-evidence-02",
            "kind": "encoded-frame",
            "artifact": "projects/tanisea-lyric-film/work/qa/run-2/selected-frames/safe-area.png",
            "sha256": "95e7ca4fb018032d54ad467648bf316e594bf901abe5076c23826ea64a4ac044",
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
            "sha256": "dfbafb175e26320640b583956bf34dc730f1ce9a19f26666bf97cd8208767b86",
            "value": "criterion 11 publication readiness verified locally"
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
      "sha256": "5f16d78bc0132c89b0b38713a629b1cfef1b080990140d69f9a34ccd453d176d"
    },
    {
      "id": "public-master",
      "path": "projects/tanisea-lyric-film/output/Tanisea-Lyric-Film-vNext-60fps-Archival-Master.mp4",
      "sha256": "dfbafb175e26320640b583956bf34dc730f1ce9a19f26666bf97cd8208767b86"
    },
    {
      "id": "sync-proof",
      "path": "projects/tanisea-lyric-film/output/Tanisea-Lyric-Film-Sync-Proof-120fps.mp4",
      "sha256": "0897bef71187fe01174b095447f9209951e2baf4cf6b6f65aa9619e775ae8310"
    },
    {
      "id": "qa-media-manifest",
      "path": "projects/tanisea-lyric-film/work/qa/media/qa-media-manifest.json",
      "sha256": "9e5322ababb2f7a9b1b402e8524fdd2749d71348befaf6b1870bd2101928bff1"
    },
    {
      "id": "v1-03-public-contact",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004224.png",
      "sha256": "64260b138117d104dcd775828389931b3d6149298d1da687e8443ae0a6cf7e7b"
    },
    {
      "id": "v1-03-public-contact-sheet",
      "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/v1-03-public.png",
      "sha256": "7953d5875abd18fcc9ced08eba8ae52eb41275f511db55e551af6cf5dc30b86a"
    },
    {
      "id": "v1-03-proof-contact-sheet",
      "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/v1-03-proof.png",
      "sha256": "11dc42bae41c72c7b57bf724692be3d08107296f8b042ffbeb1c6a08e711671b"
    },
    {
      "id": "v1-08-public-contact-sheet",
      "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/v1-08-public.png",
      "sha256": "40054ae4a9070df783fc988a1cc420dc90ae63cf5397541f63bd7e29c531d370"
    },
    {
      "id": "v1-08-proof-contact-sheet",
      "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/v1-08-proof.png",
      "sha256": "15d53072b26b28f19ec5e059cc74e5d65f712b67e24821b3b8365e865d9c483c"
    },
    {
      "id": "public-chrome-still",
      "path": "projects/tanisea-lyric-film/work/qa/media/stills/public-chrome.png",
      "sha256": "6ba12eacae3662a70466c62cdf7689b3560c5e784a494c84354c8eb1d77b2706"
    },
    {
      "id": "public-handoff-still",
      "path": "projects/tanisea-lyric-film/work/qa/media/stills/public-handoff.png",
      "sha256": "a759e35419a6fdb0d06d19a1d258faaa7eb02a4825710f6215bc48f601b56bbe"
    },
    {
      "id": "public-focus-still",
      "path": "projects/tanisea-lyric-film/work/qa/media/stills/public-focus.png",
      "sha256": "4df27b5ed8f51b8e7b297e49e75bd0d2d1f6093cc3ae5104ac5ba5760ca82222"
    },
    {
      "id": "public-safe-area-still",
      "path": "projects/tanisea-lyric-film/work/qa/media/stills/public-safe-area.png",
      "sha256": "95e7ca4fb018032d54ad467648bf316e594bf901abe5076c23826ea64a4ac044"
    },
    {
      "id": "public-spectrum-peak-still",
      "path": "projects/tanisea-lyric-film/work/qa/media/stills/public-spectrum-peak.png",
      "sha256": "c6082845631d75c74037dc11a0607ab38b14ad7d620f38938d0a990b39011a64"
    },
    {
      "id": "proof-backward-contact-still",
      "path": "projects/tanisea-lyric-film/work/qa/media/stills/proof-backward-contact.png",
      "sha256": "80be86a8d418fa922d7c82d7fa961aa4376559e5a79e58b25e0a163e08439388"
    },
    {
      "id": "reference-transition-still",
      "path": "projects/tanisea-lyric-film/work/qa/media/stills/reference-final-transition.png",
      "sha256": "b877fd90c4fc8991b192c36b88ec959fbe32720d8f5e9497c074f6f1f907f03e"
    },
    {
      "id": "qa-media-artifact-001",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/proof/v1-03-half.mp4",
      "sha256": "1e09a0892f977984166e49b07a97bfe817a8e29f5a5fd635c24d3c1749522e50"
    },
    {
      "id": "qa-media-artifact-002",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/proof/v1-03-normal.mp4",
      "sha256": "b306b3dd1719cceb390c4fbf7a7593c1a8232e56adb4ad5f99fbcb25719bd22e"
    },
    {
      "id": "qa-media-artifact-003",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/proof/v1-08-half.mp4",
      "sha256": "ac4f19aefa31c79d9ee00c72cb785eeeef0b14a806330b6aaf68fa91fe17d6b5"
    },
    {
      "id": "qa-media-artifact-004",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/proof/v1-08-normal.mp4",
      "sha256": "ad9b1606c12b61f4aa440b5a1acc638072c64d02c7338b4746eee32cd43f0bf1"
    },
    {
      "id": "qa-media-artifact-005",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/chorus-1-half.mp4",
      "sha256": "aabc3ef83bb60262dd96b0bead0b91da5c7b8b589a68a7cc472e37b12a9b0cf0"
    },
    {
      "id": "qa-media-artifact-006",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/chorus-1-normal.mp4",
      "sha256": "2dbb929d139cd31c868153a6f7ca49c9de9218b8937422f6419893b7dcb6b157"
    },
    {
      "id": "qa-media-artifact-007",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/chorus-2-half.mp4",
      "sha256": "42c02d32c80180aadc56073802bbfe233433b60955153ba5da7a2fc841337ec0"
    },
    {
      "id": "qa-media-artifact-008",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/chorus-2-normal.mp4",
      "sha256": "ffb15181c7bad962690bec949cf82dbb6fda2f2ef1f5cb75eddc673b3a3b2ae7"
    },
    {
      "id": "qa-media-artifact-009",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/final-handoff-half.mp4",
      "sha256": "228b989c920bf3f7489862a19db934263fbac4783412f969e82f608e988b19cb"
    },
    {
      "id": "qa-media-artifact-010",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/final-handoff-normal.mp4",
      "sha256": "102d24049ac2557e0d7124e24a46d6e5ca7338699d372a852c308f779564d4d7"
    },
    {
      "id": "qa-media-artifact-011",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-01-half.mp4",
      "sha256": "8a19e77b7584becac2f30cba695afd9d0dc48ee09543fe8154f836a8cfb45fc1"
    },
    {
      "id": "qa-media-artifact-012",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-01-normal.mp4",
      "sha256": "8c15595dc9299d33c71c838bf73d60d8c8f3db420b056806768e21346cac8736"
    },
    {
      "id": "qa-media-artifact-013",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-02-half.mp4",
      "sha256": "c3d62b027bd0c58206e26548d3ff5039f576947fc59261927f9a2eccc23c03fe"
    },
    {
      "id": "qa-media-artifact-014",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-02-normal.mp4",
      "sha256": "d1cacb4d36435b9f874e46cf7eeb9ff86df8bd92ee458df359075c012fe89d3e"
    },
    {
      "id": "qa-media-artifact-015",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-03-half.mp4",
      "sha256": "db1e36732e2562277d21f9e7e2e43c68959016408d6c42377111ce3333ba3f8d"
    },
    {
      "id": "qa-media-artifact-016",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-03-normal.mp4",
      "sha256": "878a7dc6b5805a1230be23e006beed9367a64cb6606f78702c73a0ae77812bca"
    },
    {
      "id": "qa-media-artifact-017",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-04-half.mp4",
      "sha256": "8b7c59f6d28a28ec371b09fe2e83b0038a741b57757d8f1c13c7127cb748a9c5"
    },
    {
      "id": "qa-media-artifact-018",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-04-normal.mp4",
      "sha256": "c6f782626708693b291988a70785f2996181e0e6667a4eb55f526a2ee3b20082"
    },
    {
      "id": "qa-media-artifact-019",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-05-half.mp4",
      "sha256": "aabc3ef83bb60262dd96b0bead0b91da5c7b8b589a68a7cc472e37b12a9b0cf0"
    },
    {
      "id": "qa-media-artifact-020",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-05-normal.mp4",
      "sha256": "2dbb929d139cd31c868153a6f7ca49c9de9218b8937422f6419893b7dcb6b157"
    },
    {
      "id": "qa-media-artifact-021",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-06-half.mp4",
      "sha256": "3a3d2c65773bf66bf6bc846660e7b3d29116d14c8ea615abcf481a89e729eaf0"
    },
    {
      "id": "qa-media-artifact-022",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-06-normal.mp4",
      "sha256": "716e0cd1e80e76babff5c2b4be2f3033564a92aa8715fe304aa38154cab6d1d3"
    },
    {
      "id": "qa-media-artifact-023",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-07-half.mp4",
      "sha256": "76f498548dce8d9ea3571adab8cf054ca78003f6822a55f333a1a11f70d02fe0"
    },
    {
      "id": "qa-media-artifact-024",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-07-normal.mp4",
      "sha256": "c1de59abdb52c6fd679b622403bb3fd1918d2aafc8da22800ea50dfc9338edb9"
    },
    {
      "id": "qa-media-artifact-025",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-08-half.mp4",
      "sha256": "539afb6bd33e96cc2390ac840e579bc4612f3a5d8b0ba505b76e7fa2f61c52d8"
    },
    {
      "id": "qa-media-artifact-026",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-08-normal.mp4",
      "sha256": "4d47a2f563f1679b283f20cd05947b5f717ba3a2afb2da8d860987c588e95a7e"
    },
    {
      "id": "qa-media-artifact-027",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-01-half.mp4",
      "sha256": "6878f3ae8f3fe5cf251397bc7c726287e48ae44e4fcb811f4997ca3089470408"
    },
    {
      "id": "qa-media-artifact-028",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-01-normal.mp4",
      "sha256": "f48f6942df38040366fc97de363ff09320b6f1b68c84a6895cd70e03cd0d2846"
    },
    {
      "id": "qa-media-artifact-029",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-02-half.mp4",
      "sha256": "ef4cef07597890238eee9ac67516518ab8bd4210c0bda85cfcd8b8cd25257c31"
    },
    {
      "id": "qa-media-artifact-030",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-02-normal.mp4",
      "sha256": "b148e200e38946b061a21846f2519efef3e04fdc6379a268109544721819f8cc"
    },
    {
      "id": "qa-media-artifact-031",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-03-half.mp4",
      "sha256": "776ecd0425f0d67b667654a1749dc17ecbe6cef16edf66df73cc200bdc3e4724"
    },
    {
      "id": "qa-media-artifact-032",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-03-normal.mp4",
      "sha256": "58acec28128b3bed138580922ddbe9abd6a214712f19eb776595e334b0ff965f"
    },
    {
      "id": "qa-media-artifact-033",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-04-half.mp4",
      "sha256": "3a593a69f8548b2ced36a26a74d5030f5d55a989b177b591a140ae013865e2f2"
    },
    {
      "id": "qa-media-artifact-034",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-04-normal.mp4",
      "sha256": "d28348149f1e80117defecf69b6bd342080a232dd759ea340d7c8d0ecd5b969a"
    },
    {
      "id": "qa-media-artifact-035",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-05-half.mp4",
      "sha256": "42c02d32c80180aadc56073802bbfe233433b60955153ba5da7a2fc841337ec0"
    },
    {
      "id": "qa-media-artifact-036",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-05-normal.mp4",
      "sha256": "ffb15181c7bad962690bec949cf82dbb6fda2f2ef1f5cb75eddc673b3a3b2ae7"
    },
    {
      "id": "qa-media-artifact-037",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-06-half.mp4",
      "sha256": "1065954699bd5dcb738edec87cd42b36c7eab1c65ebacbc16358e67413fafd03"
    },
    {
      "id": "qa-media-artifact-038",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-06-normal.mp4",
      "sha256": "8a96ce2ae391176ad5410259b8745e710492c2e1dd07e3d35abf3dfc2894ad9c"
    },
    {
      "id": "qa-media-artifact-039",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-07-half.mp4",
      "sha256": "1b94d0eb49871a82a7d5645b1a9dff99a29abaaeeeb7439c4b9d857acb572ba6"
    },
    {
      "id": "qa-media-artifact-040",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-07-normal.mp4",
      "sha256": "39066806c1e143bf599b0c285692a7c2069975535625d1f24458f417b4855a43"
    },
    {
      "id": "qa-media-artifact-041",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-08-half.mp4",
      "sha256": "faaae55ee0b8fa776d6ef4dc87f07c36bf04d25be47408c9a115d02c64199616"
    },
    {
      "id": "qa-media-artifact-042",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-08-normal.mp4",
      "sha256": "93d0ef446df00d1df0c7d5fb9f72e854da4e6c2057ec03ed6fe5000befaa9832"
    },
    {
      "id": "qa-media-artifact-043",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-01-half.mp4",
      "sha256": "2e72587640eab5523bc3e4dfa261d07f50762b980432968d9c5f069a771b910c"
    },
    {
      "id": "qa-media-artifact-044",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-01-normal.mp4",
      "sha256": "2fd0681dd979a3f3961868d7389e81511148a31bc8928863eb6bb111c05198f9"
    },
    {
      "id": "qa-media-artifact-045",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-02-half.mp4",
      "sha256": "db31a3e4f522240bedac2fc26cf5e3cce985ac1f841ee72a1b87b4f47f1fad43"
    },
    {
      "id": "qa-media-artifact-046",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-02-normal.mp4",
      "sha256": "416354e5b3d17624248c516596b1be0931dd6dd64673f0cd2ff72740368e5cba"
    },
    {
      "id": "qa-media-artifact-047",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-03-half.mp4",
      "sha256": "ca09a2fbb71e1e89b14178b4107255920907090ff4a28c38818118e7810603e5"
    },
    {
      "id": "qa-media-artifact-048",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-03-normal.mp4",
      "sha256": "2e044c7c3c1b5a1342cecbd00a1da8833eab88fcd520a60c10baa6e4712b3635"
    },
    {
      "id": "qa-media-artifact-049",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-04-half.mp4",
      "sha256": "4d67eb2af8ac105130543feac6df5413b8c0966b25197712403828472327d3c5"
    },
    {
      "id": "qa-media-artifact-050",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-04-normal.mp4",
      "sha256": "25fee0d0d8fc5fd74cebc8ecd434fe37caec3e4a437116309f390b5f9d6cf629"
    },
    {
      "id": "qa-media-artifact-051",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-05-half.mp4",
      "sha256": "930e12d41ccbe798b4917a171f6f4a38b7d852cb05286fb8303166ae89bc9b46"
    },
    {
      "id": "qa-media-artifact-052",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-05-normal.mp4",
      "sha256": "ea284eb95dbba233919ac6417cb08216e0bb22dafb4d741502fc6583a6fc0673"
    },
    {
      "id": "qa-media-artifact-053",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-06-half.mp4",
      "sha256": "506238461b23a5ae3b570978e84585d3a8822f50543f01110c47786bec640ed6"
    },
    {
      "id": "qa-media-artifact-054",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-06-normal.mp4",
      "sha256": "9738b2b8ed28dee427a5471352358427779ecabdc69bf497b88c4c39658b1512"
    },
    {
      "id": "qa-media-artifact-055",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-07-half.mp4",
      "sha256": "7d7b55a18b02f069d801858c2207b57265e9f85027dd2b922ba3c5f1e3937fc1"
    },
    {
      "id": "qa-media-artifact-056",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-07-normal.mp4",
      "sha256": "c489a6f8c10f5fad083406ac9b7cd2096c7002331684a2c02edcb6a34117cf69"
    },
    {
      "id": "qa-media-artifact-057",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-08-half.mp4",
      "sha256": "a1ecc69cc6ea8f88bdb5bf3dae65255549874284c8dac07ec446749f29c515dd"
    },
    {
      "id": "qa-media-artifact-058",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-08-normal.mp4",
      "sha256": "80b4563f275bb97ee6c93a9cee04e6679351743059525e6a7cbf0ed44892c13d"
    },
    {
      "id": "qa-media-artifact-059",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/v1-03-half.mp4",
      "sha256": "ca09a2fbb71e1e89b14178b4107255920907090ff4a28c38818118e7810603e5"
    },
    {
      "id": "qa-media-artifact-060",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/v1-03-normal.mp4",
      "sha256": "2e044c7c3c1b5a1342cecbd00a1da8833eab88fcd520a60c10baa6e4712b3635"
    },
    {
      "id": "qa-media-artifact-061",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/v1-08-half.mp4",
      "sha256": "a1ecc69cc6ea8f88bdb5bf3dae65255549874284c8dac07ec446749f29c515dd"
    },
    {
      "id": "qa-media-artifact-062",
      "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/v1-08-normal.mp4",
      "sha256": "80b4563f275bb97ee6c93a9cee04e6679351743059525e6a7cbf0ed44892c13d"
    },
    {
      "id": "qa-media-artifact-063",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008447.png",
      "sha256": "1bbce14c18ab93177334f4d84fa1f865620896224c113864bd856ee65fec2829"
    },
    {
      "id": "qa-media-artifact-064",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008448.png",
      "sha256": "4365bfc177990eb8b11e6ea97e9aef10076ffdc1a9e9884f81e569ee824aebe2"
    },
    {
      "id": "qa-media-artifact-065",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008449.png",
      "sha256": "38c4433877256eb9bf2767871ad012c06bc540dd185a370ea31c67bd3a70d0cb"
    },
    {
      "id": "qa-media-artifact-066",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008450.png",
      "sha256": "b6f3ebee69987a430fa1b3e5d97969d9809d6eae7bfec17d2338a78ff8b1e2ac"
    },
    {
      "id": "qa-media-artifact-067",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008635.png",
      "sha256": "391ea44ca984930e9d66250a7aedc1fae3a85cbb85648c83711a17f68e661d1f"
    },
    {
      "id": "qa-media-artifact-068",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008636.png",
      "sha256": "438d8e2cc5c0982a29607d6e8b260ab5d323a5017760a8f69d9e574952a76a43"
    },
    {
      "id": "qa-media-artifact-069",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008637.png",
      "sha256": "52809d3325f0e0836d93bc6366f9e180d5d1264a777dc407f53b0ff2148508dd"
    },
    {
      "id": "qa-media-artifact-070",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008638.png",
      "sha256": "0ea9a5a085bf751c6cce8d46340b54e64b865edc9ee3bbfde09363cf0e0f597f"
    },
    {
      "id": "qa-media-artifact-071",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008709.png",
      "sha256": "680db0a8924ecc839273d19430f2bf4c05c125395f96b7c9ff0c5c85d7d130d6"
    },
    {
      "id": "qa-media-artifact-072",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008710.png",
      "sha256": "fc9d9f712014154d953b75566c503cc47e56e357d49091ee7128cb20e7a3ffa6"
    },
    {
      "id": "qa-media-artifact-073",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008711.png",
      "sha256": "c4bc8a2623b5ae7d3b21fc2e7b45c077af918be36b36f4add208f6c0a2015822"
    },
    {
      "id": "qa-media-artifact-074",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008712.png",
      "sha256": "f44e764386d086ab89cbd5426c06db02c3108e9221a27b630ebd06117e751e76"
    },
    {
      "id": "qa-media-artifact-075",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004223.png",
      "sha256": "aa14816d0f995ba41ff245cd680563629e36c0d14c914a72b5fb378cb820bcfe"
    },
    {
      "id": "qa-media-artifact-076",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004225.png",
      "sha256": "99958b512bfa4e3e8e299a1457a30a2771f22a5842bf44ecb0a0759f8bac5561"
    },
    {
      "id": "qa-media-artifact-077",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004226.png",
      "sha256": "ad487b6d0c6cde87290e44b2a25a4221c6e83f05a3dbd929d2a8f3f88b0ab47d"
    },
    {
      "id": "qa-media-artifact-078",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004317.png",
      "sha256": "77120dd1e18ca0da47479b4593ec4e9fd478b3d3fc54749c84e7d96dabe0ca83"
    },
    {
      "id": "qa-media-artifact-079",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004318.png",
      "sha256": "161e00c20169ef938b54414b8359c533a8ec64d971565f27569ac327ecd21200"
    },
    {
      "id": "qa-media-artifact-080",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004319.png",
      "sha256": "c982b8e7193ca8e882f8f884d779164d48fcbe6bc1fadd7cc02ab45723a8fff4"
    },
    {
      "id": "qa-media-artifact-081",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004320.png",
      "sha256": "c867cccdc89475cca08c48774806672deff1a4867be5975fd953b402a035999c"
    },
    {
      "id": "qa-media-artifact-082",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004354.png",
      "sha256": "6810bf0346d24dad7578b63d9ea8399ff86b6824bc146530d77c9ced7779dbed"
    },
    {
      "id": "qa-media-artifact-083",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004355.png",
      "sha256": "4df27b5ed8f51b8e7b297e49e75bd0d2d1f6093cc3ae5104ac5ba5760ca82222"
    },
    {
      "id": "qa-media-artifact-084",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004356.png",
      "sha256": "dfa88d5f745335c5b6be121eb337ce06bcbc59bc090971777b0660606d9861aa"
    },
    {
      "id": "qa-media-artifact-085",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004357.png",
      "sha256": "e6c6fde5b953332d05b5e6a32fbff281d5bcf589b2acabfd0713710623a63594"
    },
    {
      "id": "qa-media-artifact-086",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010359.png",
      "sha256": "e2bfbfeb833f9ef9ffc55758c22a413218b3e4cee96adec416e67d6f7479fed3"
    },
    {
      "id": "qa-media-artifact-087",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010360.png",
      "sha256": "dd5967d883a58a94f7ea85025bd9564a58b4e45905d69d51e499fceeca32c5ae"
    },
    {
      "id": "qa-media-artifact-088",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010361.png",
      "sha256": "6cfc9f05a69e40aedfeb794c636941dc28f19cfd4a85b87319d7ac0c6a1bc992"
    },
    {
      "id": "qa-media-artifact-089",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010362.png",
      "sha256": "c9b60236df33b8c1bbae3728b7822f8266ce2e54c79b5ca069a79cf90fbc44f9"
    },
    {
      "id": "qa-media-artifact-090",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010392.png",
      "sha256": "fe3947d80e3934f530ff070f05c7b57076f0bf0fd379d496efde90504aae54f9"
    },
    {
      "id": "qa-media-artifact-091",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010393.png",
      "sha256": "992b016361e1f68d72b3de14bb5585efdedc7b7d8114834dd5f9aa245e9c5ee4"
    },
    {
      "id": "qa-media-artifact-092",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010394.png",
      "sha256": "80be86a8d418fa922d7c82d7fa961aa4376559e5a79e58b25e0a163e08439388"
    },
    {
      "id": "qa-media-artifact-093",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010395.png",
      "sha256": "7237fc10952759b7a4470fbbda643235f9bc86e8767536464a04989f14be97ba"
    },
    {
      "id": "qa-media-artifact-094",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010529.png",
      "sha256": "2b8c64948ba4662c79728457657bccffa400ef016e7f900888e3c55d68b97d8f"
    },
    {
      "id": "qa-media-artifact-095",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010530.png",
      "sha256": "deea410909cb8f1178b09418d3e1a6cd513a89465f519203d38c1d1477019ac9"
    },
    {
      "id": "qa-media-artifact-096",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010531.png",
      "sha256": "c89cff402254fd7e09911c7ffc2105dc88d7fa1f959cbb4ddb0ca637aa821e86"
    },
    {
      "id": "qa-media-artifact-097",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010532.png",
      "sha256": "bb33036bc539ccc80d80d43a520c500c0b8cef1d0c45a9468fd3dfe70aae4c06"
    },
    {
      "id": "qa-media-artifact-098",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010645.png",
      "sha256": "0800b9d82435b2435f30cf36f989d7580ffb25b74ce3e6e6408aa75d6fe3e724"
    },
    {
      "id": "qa-media-artifact-099",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010646.png",
      "sha256": "e3bb51e9f4a58cf5c82bdefb0447329194d9ec36324135271c52491b41b1d7dc"
    },
    {
      "id": "qa-media-artifact-100",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010647.png",
      "sha256": "5f5e3f629f218a8f98f274e95aeb1f0e9179b55fd76a9883878b07c7ec17ab65"
    },
    {
      "id": "qa-media-artifact-101",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010648.png",
      "sha256": "fc4b62bdf500c174446ca29e4141e493657f2bdc0326cbfa59200b9e2dc389be"
    },
    {
      "id": "qa-media-artifact-102",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005179.png",
      "sha256": "4afa33e565e96a88331821413b460179c6fc279d582d3c73d015ccf4acaf2eec"
    },
    {
      "id": "qa-media-artifact-103",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005180.png",
      "sha256": "25a33249415a13874f5f778aad57862ee4fae9dfe546c7962fa40473a05f4c68"
    },
    {
      "id": "qa-media-artifact-104",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005181.png",
      "sha256": "87387ee9245b38f24627ef5913d6ed8af6b21c7cd6086d0304b4655d1f9d4637"
    },
    {
      "id": "qa-media-artifact-105",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005182.png",
      "sha256": "264e0ef8a7b3ce53c164aab87797583864d94bde5c936fbd309d2ef3ca74ec42"
    },
    {
      "id": "qa-media-artifact-106",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005196.png",
      "sha256": "5e8ad5244355cb31f394ccf4bbcf3ba5deb1c8f8cde32b3a3e52aa245605e3a1"
    },
    {
      "id": "qa-media-artifact-107",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005197.png",
      "sha256": "e2eeeff4ed8926f1f042c25503860f4ecaf23e09955b7d5b3ab9a1164a1b9ec5"
    },
    {
      "id": "qa-media-artifact-108",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005198.png",
      "sha256": "5851e0c2dfa91056b64d9ee194b5b4ae4a7abaabc63b2d8efb39e0e99d36c48e"
    },
    {
      "id": "qa-media-artifact-109",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005199.png",
      "sha256": "920bc64d24f25ec406d425bdd5cd814eec044a64e27f64fd22308ec859775495"
    },
    {
      "id": "qa-media-artifact-110",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005264.png",
      "sha256": "1ee70eaea2c60677952719f65613c388778cbba43a918537ecfc592a7362e7c9"
    },
    {
      "id": "qa-media-artifact-111",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005265.png",
      "sha256": "b6cd32de77f6ab4b265214e1528cd7275afb73f18bb578975bebf6f70dfd318a"
    },
    {
      "id": "qa-media-artifact-112",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005266.png",
      "sha256": "130c55c4ef3089651337ca0770507c104d858533a7e5f4080b12c70860229974"
    },
    {
      "id": "qa-media-artifact-113",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005267.png",
      "sha256": "e545d9db7f44e5f393f55bfe48d84a658b605a00a517f267a218c7d8533c22a3"
    },
    {
      "id": "qa-media-artifact-114",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005322.png",
      "sha256": "a7ba7ae11030b6b436efc97ca8ff696eda48c80aff4b9d355b447382cc94ec95"
    },
    {
      "id": "qa-media-artifact-115",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005323.png",
      "sha256": "47e885f8cd1984524007189741946f3cf89dd60f8f9abf7790f9afad8ef834d3"
    },
    {
      "id": "qa-media-artifact-116",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005324.png",
      "sha256": "58a1c0d40d14256378329fc717d52c314373d02815a1299392843211e01211c6"
    },
    {
      "id": "qa-media-artifact-117",
      "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005325.png",
      "sha256": "65e3075969336359d2da770e40ac488bbe5664b52d3d800d35a6ed28e14abaa5"
    }
  ],
  "baselineRun": {
    "schemaVersion": 1,
    "runId": "run-1",
    "fullMediaExecuted": true,
    "boundedClaim": "sample-indexed alignment with frame-bounded rendering",
    "git": {
      "headCommit": "99b28cef7db6069b64790038e3369f1f0d5d124e",
      "trackedTreeSha256": "b8fb2c47a66eabd9acd04cd6d98d66de5eddaa70abc6a8155b187165287ee5e0",
      "worktreeDiffSha256": "e3d59ea21a123e922d00002012b719550baf3d12ae662094e8d33007e31628a2",
      "isClean": false,
      "statusEntries": [
        "projects/tanisea-lyric-film/package.json",
        "projects/tanisea-lyric-film/public/audio-features.bin",
        "projects/tanisea-lyric-film/public/audio-features.manifest.json",
        "projects/tanisea-lyric-film/scripts/audio-feature-commands.ts",
        "projects/tanisea-lyric-film/scripts/encode-delivery-plan.ts",
        "projects/tanisea-lyric-film/scripts/encode-delivery.ts",
        "projects/tanisea-lyric-film/scripts/generate-audio-features.ts",
        "projects/tanisea-lyric-film/scripts/make-platform-delivery.ts",
        "projects/tanisea-lyric-film/scripts/normalize-reference.ts",
        "projects/tanisea-lyric-film/scripts/project-root.ts",
        "projects/tanisea-lyric-film/scripts/release-gates.ts",
        "projects/tanisea-lyric-film/scripts/render-qa-clips.ts",
        "projects/tanisea-lyric-film/scripts/run-release-qa.ts",
        "projects/tanisea-lyric-film/scripts/verify-delivery.ts",
        "projects/tanisea-lyric-film/tests/audio-feature-commands.test.ts",
        "projects/tanisea-lyric-film/tests/encode-delivery-plan.test.ts",
        "projects/tanisea-lyric-film/tests/media-tool-root-regressions.test.ts",
        "projects/tanisea-lyric-film/tests/project-root.test.ts",
        "projects/tanisea-lyric-film/tests/qa-clips.test.ts",
        "projects/tanisea-lyric-film/tests/reference-normalization.test.ts",
        "projects/tanisea-lyric-film/tests/release-gates.test.ts",
        "projects/tanisea-lyric-film/tests/release-integration.test.ts",
        "projects/tanisea-lyric-film/tests/release-package-scripts.test.ts",
        "projects/tanisea-lyric-film/tests/release-qa-orchestrator.test.ts"
      ]
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
        "durationMs": 10317.9298,
        "logPath": "projects/tanisea-lyric-film/work/qa/run-1/logs/npm-ci.log",
        "logSha256": "be3c35943d2c87cca79020d55262ce4fd35cfc56cb42e14cd290ae74f75cbd83"
      },
      {
        "id": "check",
        "command": "npm run check",
        "exitCode": 0,
        "durationMs": 57709.380699999994,
        "logPath": "projects/tanisea-lyric-film/work/qa/run-1/logs/check.log",
        "logSha256": "f1ab0c02340b9bb909b2aef0012c4ff534cdb80bce1030820c9638917a17fc90"
      },
      {
        "id": "alignment-verify",
        "command": "npm run alignment:verify",
        "exitCode": 0,
        "durationMs": 904.7135000000126,
        "logPath": "projects/tanisea-lyric-film/work/qa/run-1/logs/alignment-verify.log",
        "logSha256": "18c09f8d2ffb7807f1d2bc9e3533bbfeb740337a820ef88f49797c3f6aa1dcf4"
      },
      {
        "id": "layout-verify",
        "command": "npm run layout:verify",
        "exitCode": 0,
        "durationMs": 9434.980800000005,
        "logPath": "projects/tanisea-lyric-film/work/qa/run-1/logs/layout-verify.log",
        "logSha256": "0f562b48e1cbc8ed96ee173dcf2fedd3141fb12c9d780f9b799e7c1fc224808f"
      },
      {
        "id": "compositions",
        "command": "npm run compositions",
        "exitCode": 0,
        "durationMs": 3590.3942000000097,
        "logPath": "projects/tanisea-lyric-film/work/qa/run-1/logs/compositions.log",
        "logSha256": "e98dc72f6551fada719fa70e99fbb8575aa01bd33ef411cb292c500ad94c2afe"
      },
      {
        "id": "verify-reference",
        "command": "npm run verify -- --kind reference",
        "exitCode": 0,
        "durationMs": 742870.4916000001,
        "logPath": "projects/tanisea-lyric-film/work/qa/run-1/logs/verify-reference.log",
        "logSha256": "d2c068903304fb70b8ecd363d770dccb53b232f407166bb525e0b0f9c47cda1a"
      },
      {
        "id": "verify-public",
        "command": "npm run verify -- --kind public",
        "exitCode": 0,
        "durationMs": 24087.044600000023,
        "logPath": "projects/tanisea-lyric-film/work/qa/run-1/logs/verify-public.log",
        "logSha256": "4cc96f092eba8f2f642e507525fb5aaf257b25cb6de7d0b9b724c0de4f7008fb"
      },
      {
        "id": "verify-proof",
        "command": "npm run verify -- --kind proof",
        "exitCode": 0,
        "durationMs": 33327.300499999896,
        "logPath": "projects/tanisea-lyric-film/work/qa/run-1/logs/verify-proof.log",
        "logSha256": "b8aac99121411a632b97e739e39ab88ec311a323743522bf9b96d465ea9179e4"
      },
      {
        "id": "verify-public-markup",
        "command": "npm run test:run -- tests/release-gates.test.ts -t \"public-markup release gate\"",
        "exitCode": 0,
        "durationMs": 1450.6638000000967,
        "logPath": "projects/tanisea-lyric-film/work/qa/run-1/logs/verify-public-markup.log",
        "logSha256": "f5ac49d57879417d0d4df8060951909490619f40d7e9f938845b19fe2d996f84"
      },
      {
        "id": "verify-matrix",
        "command": "npm run test:run -- tests/release-gates.test.ts -t \"requirement-matrix release gate\"",
        "exitCode": 0,
        "durationMs": 1163.5770000000484,
        "logPath": "projects/tanisea-lyric-film/work/qa/run-1/logs/verify-matrix.log",
        "logSha256": "994aeb11ffc475c1c18a8d177551592a386b807a629268b45ccd9884985aaeb4"
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
        "sizeBytes": 28721088575,
        "sha256": "5f16d78bc0132c89b0b38713a629b1cfef1b080990140d69f9a34ccd453d176d"
      },
      {
        "id": "public-master",
        "kind": "public",
        "path": "projects/tanisea-lyric-film/output/Tanisea-Lyric-Film-vNext-60fps-Archival-Master.mp4",
        "sizeBytes": 21763636,
        "sha256": "dfbafb175e26320640b583956bf34dc730f1ce9a19f26666bf97cd8208767b86"
      },
      {
        "id": "sync-proof",
        "kind": "proof",
        "path": "projects/tanisea-lyric-film/output/Tanisea-Lyric-Film-Sync-Proof-120fps.mp4",
        "sizeBytes": 167627313,
        "sha256": "0897bef71187fe01174b095447f9209951e2baf4cf6b6f65aa9619e775ae8310"
      },
      {
        "id": "qa-media-manifest",
        "kind": "qa-manifest",
        "path": "projects/tanisea-lyric-film/work/qa/media/qa-media-manifest.json",
        "sizeBytes": 22724,
        "sha256": "9e5322ababb2f7a9b1b402e8524fdd2749d71348befaf6b1870bd2101928bff1"
      },
      {
        "id": "v1-03-public-contact",
        "kind": "qa-contact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004224.png",
        "sizeBytes": 3396061,
        "sha256": "64260b138117d104dcd775828389931b3d6149298d1da687e8443ae0a6cf7e7b"
      },
      {
        "id": "v1-03-public-contact-sheet",
        "kind": "qa-contact-sheet",
        "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/v1-03-public.png",
        "sizeBytes": 1730793,
        "sha256": "7953d5875abd18fcc9ced08eba8ae52eb41275f511db55e551af6cf5dc30b86a"
      },
      {
        "id": "v1-03-proof-contact-sheet",
        "kind": "qa-contact-sheet",
        "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/v1-03-proof.png",
        "sizeBytes": 1749845,
        "sha256": "11dc42bae41c72c7b57bf724692be3d08107296f8b042ffbeb1c6a08e711671b"
      },
      {
        "id": "v1-08-public-contact-sheet",
        "kind": "qa-contact-sheet",
        "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/v1-08-public.png",
        "sizeBytes": 1849789,
        "sha256": "40054ae4a9070df783fc988a1cc420dc90ae63cf5397541f63bd7e29c531d370"
      },
      {
        "id": "v1-08-proof-contact-sheet",
        "kind": "qa-contact-sheet",
        "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/v1-08-proof.png",
        "sizeBytes": 2436009,
        "sha256": "15d53072b26b28f19ec5e059cc74e5d65f712b67e24821b3b8365e865d9c483c"
      },
      {
        "id": "public-chrome-still",
        "kind": "qa-still",
        "path": "projects/tanisea-lyric-film/work/qa/media/stills/public-chrome.png",
        "sizeBytes": 3355892,
        "sha256": "6ba12eacae3662a70466c62cdf7689b3560c5e784a494c84354c8eb1d77b2706"
      },
      {
        "id": "public-handoff-still",
        "kind": "qa-still",
        "path": "projects/tanisea-lyric-film/work/qa/media/stills/public-handoff.png",
        "sizeBytes": 3191585,
        "sha256": "a759e35419a6fdb0d06d19a1d258faaa7eb02a4825710f6215bc48f601b56bbe"
      },
      {
        "id": "public-focus-still",
        "kind": "qa-still",
        "path": "projects/tanisea-lyric-film/work/qa/media/stills/public-focus.png",
        "sizeBytes": 3099469,
        "sha256": "4df27b5ed8f51b8e7b297e49e75bd0d2d1f6093cc3ae5104ac5ba5760ca82222"
      },
      {
        "id": "public-safe-area-still",
        "kind": "qa-still",
        "path": "projects/tanisea-lyric-film/work/qa/media/stills/public-safe-area.png",
        "sizeBytes": 3219449,
        "sha256": "95e7ca4fb018032d54ad467648bf316e594bf901abe5076c23826ea64a4ac044"
      },
      {
        "id": "public-spectrum-peak-still",
        "kind": "qa-still",
        "path": "projects/tanisea-lyric-film/work/qa/media/stills/public-spectrum-peak.png",
        "sizeBytes": 3381180,
        "sha256": "c6082845631d75c74037dc11a0607ab38b14ad7d620f38938d0a990b39011a64"
      },
      {
        "id": "proof-backward-contact-still",
        "kind": "qa-still",
        "path": "projects/tanisea-lyric-film/work/qa/media/stills/proof-backward-contact.png",
        "sizeBytes": 879241,
        "sha256": "80be86a8d418fa922d7c82d7fa961aa4376559e5a79e58b25e0a163e08439388"
      },
      {
        "id": "reference-transition-still",
        "kind": "qa-still",
        "path": "projects/tanisea-lyric-film/work/qa/media/stills/reference-final-transition.png",
        "sizeBytes": 20658733,
        "sha256": "b877fd90c4fc8991b192c36b88ec959fbe32720d8f5e9497c074f6f1f907f03e"
      },
      {
        "id": "qa-media-artifact-001",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/proof/v1-03-half.mp4",
        "sizeBytes": 1415383,
        "sha256": "1e09a0892f977984166e49b07a97bfe817a8e29f5a5fd635c24d3c1749522e50"
      },
      {
        "id": "qa-media-artifact-002",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/proof/v1-03-normal.mp4",
        "sizeBytes": 1085669,
        "sha256": "b306b3dd1719cceb390c4fbf7a7593c1a8232e56adb4ad5f99fbcb25719bd22e"
      },
      {
        "id": "qa-media-artifact-003",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/proof/v1-08-half.mp4",
        "sizeBytes": 1525568,
        "sha256": "ac4f19aefa31c79d9ee00c72cb785eeeef0b14a806330b6aaf68fa91fe17d6b5"
      },
      {
        "id": "qa-media-artifact-004",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/proof/v1-08-normal.mp4",
        "sizeBytes": 1174397,
        "sha256": "ad9b1606c12b61f4aa440b5a1acc638072c64d02c7338b4746eee32cd43f0bf1"
      },
      {
        "id": "qa-media-artifact-005",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/chorus-1-half.mp4",
        "sizeBytes": 755796,
        "sha256": "aabc3ef83bb60262dd96b0bead0b91da5c7b8b589a68a7cc472e37b12a9b0cf0"
      },
      {
        "id": "qa-media-artifact-006",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/chorus-1-normal.mp4",
        "sizeBytes": 548419,
        "sha256": "2dbb929d139cd31c868153a6f7ca49c9de9218b8937422f6419893b7dcb6b157"
      },
      {
        "id": "qa-media-artifact-007",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/chorus-2-half.mp4",
        "sizeBytes": 737791,
        "sha256": "42c02d32c80180aadc56073802bbfe233433b60955153ba5da7a2fc841337ec0"
      },
      {
        "id": "qa-media-artifact-008",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/chorus-2-normal.mp4",
        "sizeBytes": 537894,
        "sha256": "ffb15181c7bad962690bec949cf82dbb6fda2f2ef1f5cb75eddc673b3a3b2ae7"
      },
      {
        "id": "qa-media-artifact-009",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/final-handoff-half.mp4",
        "sizeBytes": 624104,
        "sha256": "228b989c920bf3f7489862a19db934263fbac4783412f969e82f608e988b19cb"
      },
      {
        "id": "qa-media-artifact-010",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/final-handoff-normal.mp4",
        "sizeBytes": 445230,
        "sha256": "102d24049ac2557e0d7124e24a46d6e5ca7338699d372a852c308f779564d4d7"
      },
      {
        "id": "qa-media-artifact-011",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-01-half.mp4",
        "sizeBytes": 691338,
        "sha256": "8a19e77b7584becac2f30cba695afd9d0dc48ee09543fe8154f836a8cfb45fc1"
      },
      {
        "id": "qa-media-artifact-012",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-01-normal.mp4",
        "sizeBytes": 497085,
        "sha256": "8c15595dc9299d33c71c838bf73d60d8c8f3db420b056806768e21346cac8736"
      },
      {
        "id": "qa-media-artifact-013",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-02-half.mp4",
        "sizeBytes": 646691,
        "sha256": "c3d62b027bd0c58206e26548d3ff5039f576947fc59261927f9a2eccc23c03fe"
      },
      {
        "id": "qa-media-artifact-014",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-02-normal.mp4",
        "sizeBytes": 467193,
        "sha256": "d1cacb4d36435b9f874e46cf7eeb9ff86df8bd92ee458df359075c012fe89d3e"
      },
      {
        "id": "qa-media-artifact-015",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-03-half.mp4",
        "sizeBytes": 576809,
        "sha256": "db1e36732e2562277d21f9e7e2e43c68959016408d6c42377111ce3333ba3f8d"
      },
      {
        "id": "qa-media-artifact-016",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-03-normal.mp4",
        "sizeBytes": 417485,
        "sha256": "878a7dc6b5805a1230be23e006beed9367a64cb6606f78702c73a0ae77812bca"
      },
      {
        "id": "qa-media-artifact-017",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-04-half.mp4",
        "sizeBytes": 674181,
        "sha256": "8b7c59f6d28a28ec371b09fe2e83b0038a741b57757d8f1c13c7127cb748a9c5"
      },
      {
        "id": "qa-media-artifact-018",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-04-normal.mp4",
        "sizeBytes": 478039,
        "sha256": "c6f782626708693b291988a70785f2996181e0e6667a4eb55f526a2ee3b20082"
      },
      {
        "id": "qa-media-artifact-019",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-05-half.mp4",
        "sizeBytes": 755796,
        "sha256": "aabc3ef83bb60262dd96b0bead0b91da5c7b8b589a68a7cc472e37b12a9b0cf0"
      },
      {
        "id": "qa-media-artifact-020",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-05-normal.mp4",
        "sizeBytes": 548419,
        "sha256": "2dbb929d139cd31c868153a6f7ca49c9de9218b8937422f6419893b7dcb6b157"
      },
      {
        "id": "qa-media-artifact-021",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-06-half.mp4",
        "sizeBytes": 708746,
        "sha256": "3a3d2c65773bf66bf6bc846660e7b3d29116d14c8ea615abcf481a89e729eaf0"
      },
      {
        "id": "qa-media-artifact-022",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-06-normal.mp4",
        "sizeBytes": 513166,
        "sha256": "716e0cd1e80e76babff5c2b4be2f3033564a92aa8715fe304aa38154cab6d1d3"
      },
      {
        "id": "qa-media-artifact-023",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-07-half.mp4",
        "sizeBytes": 677383,
        "sha256": "76f498548dce8d9ea3571adab8cf054ca78003f6822a55f333a1a11f70d02fe0"
      },
      {
        "id": "qa-media-artifact-024",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-07-normal.mp4",
        "sizeBytes": 492335,
        "sha256": "c1de59abdb52c6fd679b622403bb3fd1918d2aafc8da22800ea50dfc9338edb9"
      },
      {
        "id": "qa-media-artifact-025",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-08-half.mp4",
        "sizeBytes": 687737,
        "sha256": "539afb6bd33e96cc2390ac840e579bc4612f3a5d8b0ba505b76e7fa2f61c52d8"
      },
      {
        "id": "qa-media-artifact-026",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-08-normal.mp4",
        "sizeBytes": 492851,
        "sha256": "4d47a2f563f1679b283f20cd05947b5f717ba3a2afb2da8d860987c588e95a7e"
      },
      {
        "id": "qa-media-artifact-027",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-01-half.mp4",
        "sizeBytes": 618257,
        "sha256": "6878f3ae8f3fe5cf251397bc7c726287e48ae44e4fcb811f4997ca3089470408"
      },
      {
        "id": "qa-media-artifact-028",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-01-normal.mp4",
        "sizeBytes": 436532,
        "sha256": "f48f6942df38040366fc97de363ff09320b6f1b68c84a6895cd70e03cd0d2846"
      },
      {
        "id": "qa-media-artifact-029",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-02-half.mp4",
        "sizeBytes": 662776,
        "sha256": "ef4cef07597890238eee9ac67516518ab8bd4210c0bda85cfcd8b8cd25257c31"
      },
      {
        "id": "qa-media-artifact-030",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-02-normal.mp4",
        "sizeBytes": 481078,
        "sha256": "b148e200e38946b061a21846f2519efef3e04fdc6379a268109544721819f8cc"
      },
      {
        "id": "qa-media-artifact-031",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-03-half.mp4",
        "sizeBytes": 575747,
        "sha256": "776ecd0425f0d67b667654a1749dc17ecbe6cef16edf66df73cc200bdc3e4724"
      },
      {
        "id": "qa-media-artifact-032",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-03-normal.mp4",
        "sizeBytes": 414074,
        "sha256": "58acec28128b3bed138580922ddbe9abd6a214712f19eb776595e334b0ff965f"
      },
      {
        "id": "qa-media-artifact-033",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-04-half.mp4",
        "sizeBytes": 653740,
        "sha256": "3a593a69f8548b2ced36a26a74d5030f5d55a989b177b591a140ae013865e2f2"
      },
      {
        "id": "qa-media-artifact-034",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-04-normal.mp4",
        "sizeBytes": 468372,
        "sha256": "d28348149f1e80117defecf69b6bd342080a232dd759ea340d7c8d0ecd5b969a"
      },
      {
        "id": "qa-media-artifact-035",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-05-half.mp4",
        "sizeBytes": 737791,
        "sha256": "42c02d32c80180aadc56073802bbfe233433b60955153ba5da7a2fc841337ec0"
      },
      {
        "id": "qa-media-artifact-036",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-05-normal.mp4",
        "sizeBytes": 537894,
        "sha256": "ffb15181c7bad962690bec949cf82dbb6fda2f2ef1f5cb75eddc673b3a3b2ae7"
      },
      {
        "id": "qa-media-artifact-037",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-06-half.mp4",
        "sizeBytes": 726141,
        "sha256": "1065954699bd5dcb738edec87cd42b36c7eab1c65ebacbc16358e67413fafd03"
      },
      {
        "id": "qa-media-artifact-038",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-06-normal.mp4",
        "sizeBytes": 520665,
        "sha256": "8a96ce2ae391176ad5410259b8745e710492c2e1dd07e3d35abf3dfc2894ad9c"
      },
      {
        "id": "qa-media-artifact-039",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-07-half.mp4",
        "sizeBytes": 614450,
        "sha256": "1b94d0eb49871a82a7d5645b1a9dff99a29abaaeeeb7439c4b9d857acb572ba6"
      },
      {
        "id": "qa-media-artifact-040",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-07-normal.mp4",
        "sizeBytes": 446127,
        "sha256": "39066806c1e143bf599b0c285692a7c2069975535625d1f24458f417b4855a43"
      },
      {
        "id": "qa-media-artifact-041",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-08-half.mp4",
        "sizeBytes": 613298,
        "sha256": "faaae55ee0b8fa776d6ef4dc87f07c36bf04d25be47408c9a115d02c64199616"
      },
      {
        "id": "qa-media-artifact-042",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-08-normal.mp4",
        "sizeBytes": 441975,
        "sha256": "93d0ef446df00d1df0c7d5fb9f72e854da4e6c2057ec03ed6fe5000befaa9832"
      },
      {
        "id": "qa-media-artifact-043",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-01-half.mp4",
        "sizeBytes": 722974,
        "sha256": "2e72587640eab5523bc3e4dfa261d07f50762b980432968d9c5f069a771b910c"
      },
      {
        "id": "qa-media-artifact-044",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-01-normal.mp4",
        "sizeBytes": 524360,
        "sha256": "2fd0681dd979a3f3961868d7389e81511148a31bc8928863eb6bb111c05198f9"
      },
      {
        "id": "qa-media-artifact-045",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-02-half.mp4",
        "sizeBytes": 644165,
        "sha256": "db31a3e4f522240bedac2fc26cf5e3cce985ac1f841ee72a1b87b4f47f1fad43"
      },
      {
        "id": "qa-media-artifact-046",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-02-normal.mp4",
        "sizeBytes": 460833,
        "sha256": "416354e5b3d17624248c516596b1be0931dd6dd64673f0cd2ff72740368e5cba"
      },
      {
        "id": "qa-media-artifact-047",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-03-half.mp4",
        "sizeBytes": 655534,
        "sha256": "ca09a2fbb71e1e89b14178b4107255920907090ff4a28c38818118e7810603e5"
      },
      {
        "id": "qa-media-artifact-048",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-03-normal.mp4",
        "sizeBytes": 470583,
        "sha256": "2e044c7c3c1b5a1342cecbd00a1da8833eab88fcd520a60c10baa6e4712b3635"
      },
      {
        "id": "qa-media-artifact-049",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-04-half.mp4",
        "sizeBytes": 664304,
        "sha256": "4d67eb2af8ac105130543feac6df5413b8c0966b25197712403828472327d3c5"
      },
      {
        "id": "qa-media-artifact-050",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-04-normal.mp4",
        "sizeBytes": 487114,
        "sha256": "25fee0d0d8fc5fd74cebc8ecd434fe37caec3e4a437116309f390b5f9d6cf629"
      },
      {
        "id": "qa-media-artifact-051",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-05-half.mp4",
        "sizeBytes": 693665,
        "sha256": "930e12d41ccbe798b4917a171f6f4a38b7d852cb05286fb8303166ae89bc9b46"
      },
      {
        "id": "qa-media-artifact-052",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-05-normal.mp4",
        "sizeBytes": 500710,
        "sha256": "ea284eb95dbba233919ac6417cb08216e0bb22dafb4d741502fc6583a6fc0673"
      },
      {
        "id": "qa-media-artifact-053",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-06-half.mp4",
        "sizeBytes": 682953,
        "sha256": "506238461b23a5ae3b570978e84585d3a8822f50543f01110c47786bec640ed6"
      },
      {
        "id": "qa-media-artifact-054",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-06-normal.mp4",
        "sizeBytes": 492265,
        "sha256": "9738b2b8ed28dee427a5471352358427779ecabdc69bf497b88c4c39658b1512"
      },
      {
        "id": "qa-media-artifact-055",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-07-half.mp4",
        "sizeBytes": 658375,
        "sha256": "7d7b55a18b02f069d801858c2207b57265e9f85027dd2b922ba3c5f1e3937fc1"
      },
      {
        "id": "qa-media-artifact-056",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-07-normal.mp4",
        "sizeBytes": 475727,
        "sha256": "c489a6f8c10f5fad083406ac9b7cd2096c7002331684a2c02edcb6a34117cf69"
      },
      {
        "id": "qa-media-artifact-057",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-08-half.mp4",
        "sizeBytes": 667337,
        "sha256": "a1ecc69cc6ea8f88bdb5bf3dae65255549874284c8dac07ec446749f29c515dd"
      },
      {
        "id": "qa-media-artifact-058",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-08-normal.mp4",
        "sizeBytes": 483218,
        "sha256": "80b4563f275bb97ee6c93a9cee04e6679351743059525e6a7cbf0ed44892c13d"
      },
      {
        "id": "qa-media-artifact-059",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/v1-03-half.mp4",
        "sizeBytes": 655534,
        "sha256": "ca09a2fbb71e1e89b14178b4107255920907090ff4a28c38818118e7810603e5"
      },
      {
        "id": "qa-media-artifact-060",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/v1-03-normal.mp4",
        "sizeBytes": 470583,
        "sha256": "2e044c7c3c1b5a1342cecbd00a1da8833eab88fcd520a60c10baa6e4712b3635"
      },
      {
        "id": "qa-media-artifact-061",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/v1-08-half.mp4",
        "sizeBytes": 667337,
        "sha256": "a1ecc69cc6ea8f88bdb5bf3dae65255549874284c8dac07ec446749f29c515dd"
      },
      {
        "id": "qa-media-artifact-062",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/v1-08-normal.mp4",
        "sizeBytes": 483218,
        "sha256": "80b4563f275bb97ee6c93a9cee04e6679351743059525e6a7cbf0ed44892c13d"
      },
      {
        "id": "qa-media-artifact-063",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008447.png",
        "sizeBytes": 789711,
        "sha256": "1bbce14c18ab93177334f4d84fa1f865620896224c113864bd856ee65fec2829"
      },
      {
        "id": "qa-media-artifact-064",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008448.png",
        "sizeBytes": 947526,
        "sha256": "4365bfc177990eb8b11e6ea97e9aef10076ffdc1a9e9884f81e569ee824aebe2"
      },
      {
        "id": "qa-media-artifact-065",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008449.png",
        "sizeBytes": 937767,
        "sha256": "38c4433877256eb9bf2767871ad012c06bc540dd185a370ea31c67bd3a70d0cb"
      },
      {
        "id": "qa-media-artifact-066",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008450.png",
        "sizeBytes": 944532,
        "sha256": "b6f3ebee69987a430fa1b3e5d97969d9809d6eae7bfec17d2338a78ff8b1e2ac"
      },
      {
        "id": "qa-media-artifact-067",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008635.png",
        "sizeBytes": 733078,
        "sha256": "391ea44ca984930e9d66250a7aedc1fae3a85cbb85648c83711a17f68e661d1f"
      },
      {
        "id": "qa-media-artifact-068",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008636.png",
        "sizeBytes": 857090,
        "sha256": "438d8e2cc5c0982a29607d6e8b260ab5d323a5017760a8f69d9e574952a76a43"
      },
      {
        "id": "qa-media-artifact-069",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008637.png",
        "sizeBytes": 856682,
        "sha256": "52809d3325f0e0836d93bc6366f9e180d5d1264a777dc407f53b0ff2148508dd"
      },
      {
        "id": "qa-media-artifact-070",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008638.png",
        "sizeBytes": 856913,
        "sha256": "0ea9a5a085bf751c6cce8d46340b54e64b865edc9ee3bbfde09363cf0e0f597f"
      },
      {
        "id": "qa-media-artifact-071",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008709.png",
        "sizeBytes": 737339,
        "sha256": "680db0a8924ecc839273d19430f2bf4c05c125395f96b7c9ff0c5c85d7d130d6"
      },
      {
        "id": "qa-media-artifact-072",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008710.png",
        "sizeBytes": 856509,
        "sha256": "fc9d9f712014154d953b75566c503cc47e56e357d49091ee7128cb20e7a3ffa6"
      },
      {
        "id": "qa-media-artifact-073",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008711.png",
        "sizeBytes": 860917,
        "sha256": "c4bc8a2623b5ae7d3b21fc2e7b45c077af918be36b36f4add208f6c0a2015822"
      },
      {
        "id": "qa-media-artifact-074",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008712.png",
        "sizeBytes": 862797,
        "sha256": "f44e764386d086ab89cbd5426c06db02c3108e9221a27b630ebd06117e751e76"
      },
      {
        "id": "qa-media-artifact-075",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004223.png",
        "sizeBytes": 3335589,
        "sha256": "aa14816d0f995ba41ff245cd680563629e36c0d14c914a72b5fb378cb820bcfe"
      },
      {
        "id": "qa-media-artifact-076",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004225.png",
        "sizeBytes": 3388702,
        "sha256": "99958b512bfa4e3e8e299a1457a30a2771f22a5842bf44ecb0a0759f8bac5561"
      },
      {
        "id": "qa-media-artifact-077",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004226.png",
        "sizeBytes": 3377056,
        "sha256": "ad487b6d0c6cde87290e44b2a25a4221c6e83f05a3dbd929d2a8f3f88b0ab47d"
      },
      {
        "id": "qa-media-artifact-078",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004317.png",
        "sizeBytes": 3101521,
        "sha256": "77120dd1e18ca0da47479b4593ec4e9fd478b3d3fc54749c84e7d96dabe0ca83"
      },
      {
        "id": "qa-media-artifact-079",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004318.png",
        "sizeBytes": 3101376,
        "sha256": "161e00c20169ef938b54414b8359c533a8ec64d971565f27569ac327ecd21200"
      },
      {
        "id": "qa-media-artifact-080",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004319.png",
        "sizeBytes": 3099928,
        "sha256": "c982b8e7193ca8e882f8f884d779164d48fcbe6bc1fadd7cc02ab45723a8fff4"
      },
      {
        "id": "qa-media-artifact-081",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004320.png",
        "sizeBytes": 3107400,
        "sha256": "c867cccdc89475cca08c48774806672deff1a4867be5975fd953b402a035999c"
      },
      {
        "id": "qa-media-artifact-082",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004354.png",
        "sizeBytes": 3093633,
        "sha256": "6810bf0346d24dad7578b63d9ea8399ff86b6824bc146530d77c9ced7779dbed"
      },
      {
        "id": "qa-media-artifact-083",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004355.png",
        "sizeBytes": 3099469,
        "sha256": "4df27b5ed8f51b8e7b297e49e75bd0d2d1f6093cc3ae5104ac5ba5760ca82222"
      },
      {
        "id": "qa-media-artifact-084",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004356.png",
        "sizeBytes": 3110683,
        "sha256": "dfa88d5f745335c5b6be121eb337ce06bcbc59bc090971777b0660606d9861aa"
      },
      {
        "id": "qa-media-artifact-085",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004357.png",
        "sizeBytes": 3159051,
        "sha256": "e6c6fde5b953332d05b5e6a32fbff281d5bcf589b2acabfd0713710623a63594"
      },
      {
        "id": "qa-media-artifact-086",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010359.png",
        "sizeBytes": 755782,
        "sha256": "e2bfbfeb833f9ef9ffc55758c22a413218b3e4cee96adec416e67d6f7479fed3"
      },
      {
        "id": "qa-media-artifact-087",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010360.png",
        "sizeBytes": 867194,
        "sha256": "dd5967d883a58a94f7ea85025bd9564a58b4e45905d69d51e499fceeca32c5ae"
      },
      {
        "id": "qa-media-artifact-088",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010361.png",
        "sizeBytes": 871578,
        "sha256": "6cfc9f05a69e40aedfeb794c636941dc28f19cfd4a85b87319d7ac0c6a1bc992"
      },
      {
        "id": "qa-media-artifact-089",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010362.png",
        "sizeBytes": 871788,
        "sha256": "c9b60236df33b8c1bbae3728b7822f8266ce2e54c79b5ca069a79cf90fbc44f9"
      },
      {
        "id": "qa-media-artifact-090",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010392.png",
        "sizeBytes": 747961,
        "sha256": "fe3947d80e3934f530ff070f05c7b57076f0bf0fd379d496efde90504aae54f9"
      },
      {
        "id": "qa-media-artifact-091",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010393.png",
        "sizeBytes": 877865,
        "sha256": "992b016361e1f68d72b3de14bb5585efdedc7b7d8114834dd5f9aa245e9c5ee4"
      },
      {
        "id": "qa-media-artifact-092",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010394.png",
        "sizeBytes": 879241,
        "sha256": "80be86a8d418fa922d7c82d7fa961aa4376559e5a79e58b25e0a163e08439388"
      },
      {
        "id": "qa-media-artifact-093",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010395.png",
        "sizeBytes": 884530,
        "sha256": "7237fc10952759b7a4470fbbda643235f9bc86e8767536464a04989f14be97ba"
      },
      {
        "id": "qa-media-artifact-094",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010529.png",
        "sizeBytes": 721527,
        "sha256": "2b8c64948ba4662c79728457657bccffa400ef016e7f900888e3c55d68b97d8f"
      },
      {
        "id": "qa-media-artifact-095",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010530.png",
        "sizeBytes": 863325,
        "sha256": "deea410909cb8f1178b09418d3e1a6cd513a89465f519203d38c1d1477019ac9"
      },
      {
        "id": "qa-media-artifact-096",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010531.png",
        "sizeBytes": 857016,
        "sha256": "c89cff402254fd7e09911c7ffc2105dc88d7fa1f959cbb4ddb0ca637aa821e86"
      },
      {
        "id": "qa-media-artifact-097",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010532.png",
        "sizeBytes": 859621,
        "sha256": "bb33036bc539ccc80d80d43a520c500c0b8cef1d0c45a9468fd3dfe70aae4c06"
      },
      {
        "id": "qa-media-artifact-098",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010645.png",
        "sizeBytes": 731000,
        "sha256": "0800b9d82435b2435f30cf36f989d7580ffb25b74ce3e6e6408aa75d6fe3e724"
      },
      {
        "id": "qa-media-artifact-099",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010646.png",
        "sizeBytes": 848079,
        "sha256": "e3bb51e9f4a58cf5c82bdefb0447329194d9ec36324135271c52491b41b1d7dc"
      },
      {
        "id": "qa-media-artifact-100",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010647.png",
        "sizeBytes": 855682,
        "sha256": "5f5e3f629f218a8f98f274e95aeb1f0e9179b55fd76a9883878b07c7ec17ab65"
      },
      {
        "id": "qa-media-artifact-101",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010648.png",
        "sizeBytes": 856130,
        "sha256": "fc4b62bdf500c174446ca29e4141e493657f2bdc0326cbfa59200b9e2dc389be"
      },
      {
        "id": "qa-media-artifact-102",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005179.png",
        "sizeBytes": 3246911,
        "sha256": "4afa33e565e96a88331821413b460179c6fc279d582d3c73d015ccf4acaf2eec"
      },
      {
        "id": "qa-media-artifact-103",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005180.png",
        "sizeBytes": 3259085,
        "sha256": "25a33249415a13874f5f778aad57862ee4fae9dfe546c7962fa40473a05f4c68"
      },
      {
        "id": "qa-media-artifact-104",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005181.png",
        "sizeBytes": 3259942,
        "sha256": "87387ee9245b38f24627ef5913d6ed8af6b21c7cd6086d0304b4655d1f9d4637"
      },
      {
        "id": "qa-media-artifact-105",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005182.png",
        "sizeBytes": 3262372,
        "sha256": "264e0ef8a7b3ce53c164aab87797583864d94bde5c936fbd309d2ef3ca74ec42"
      },
      {
        "id": "qa-media-artifact-106",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005196.png",
        "sizeBytes": 3284835,
        "sha256": "5e8ad5244355cb31f394ccf4bbcf3ba5deb1c8f8cde32b3a3e52aa245605e3a1"
      },
      {
        "id": "qa-media-artifact-107",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005197.png",
        "sizeBytes": 3284563,
        "sha256": "e2eeeff4ed8926f1f042c25503860f4ecaf23e09955b7d5b3ab9a1164a1b9ec5"
      },
      {
        "id": "qa-media-artifact-108",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005198.png",
        "sizeBytes": 3283510,
        "sha256": "5851e0c2dfa91056b64d9ee194b5b4ae4a7abaabc63b2d8efb39e0e99d36c48e"
      },
      {
        "id": "qa-media-artifact-109",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005199.png",
        "sizeBytes": 3275411,
        "sha256": "920bc64d24f25ec406d425bdd5cd814eec044a64e27f64fd22308ec859775495"
      },
      {
        "id": "qa-media-artifact-110",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005264.png",
        "sizeBytes": 3030708,
        "sha256": "1ee70eaea2c60677952719f65613c388778cbba43a918537ecfc592a7362e7c9"
      },
      {
        "id": "qa-media-artifact-111",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005265.png",
        "sizeBytes": 3044990,
        "sha256": "b6cd32de77f6ab4b265214e1528cd7275afb73f18bb578975bebf6f70dfd318a"
      },
      {
        "id": "qa-media-artifact-112",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005266.png",
        "sizeBytes": 3048647,
        "sha256": "130c55c4ef3089651337ca0770507c104d858533a7e5f4080b12c70860229974"
      },
      {
        "id": "qa-media-artifact-113",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005267.png",
        "sizeBytes": 3053892,
        "sha256": "e545d9db7f44e5f393f55bfe48d84a658b605a00a517f267a218c7d8533c22a3"
      },
      {
        "id": "qa-media-artifact-114",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005322.png",
        "sizeBytes": 3143726,
        "sha256": "a7ba7ae11030b6b436efc97ca8ff696eda48c80aff4b9d355b447382cc94ec95"
      },
      {
        "id": "qa-media-artifact-115",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005323.png",
        "sizeBytes": 3160970,
        "sha256": "47e885f8cd1984524007189741946f3cf89dd60f8f9abf7790f9afad8ef834d3"
      },
      {
        "id": "qa-media-artifact-116",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005324.png",
        "sizeBytes": 3165131,
        "sha256": "58a1c0d40d14256378329fc717d52c314373d02815a1299392843211e01211c6"
      },
      {
        "id": "qa-media-artifact-117",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005325.png",
        "sizeBytes": 3155238,
        "sha256": "65e3075969336359d2da770e40ac488bbe5664b52d3d800d35a6ed28e14abaa5"
      }
    ],
    "media": {
      "reference": {
        "artifactId": "reference-render",
        "fileSha256": {
          "value": "5f16d78bc0132c89b0b38713a629b1cfef1b080990140d69f9a34ccd453d176d",
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
          "value": "dfbafb175e26320640b583956bf34dc730f1ce9a19f26666bf97cd8208767b86",
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
          "value": "0897bef71187fe01174b095447f9209951e2baf4cf6b6f65aa9619e775ae8310",
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
        "final-handoff"
      ],
      "proofRanges": [
        "v1-03",
        "v1-08"
      ],
      "cueIds": [
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
              "sha256": "f1ab0c02340b9bb909b2aef0012c4ff534cdb80bce1030820c9638917a17fc90",
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
              "sha256": "4cc96f092eba8f2f642e507525fb5aaf257b25cb6de7d0b9b724c0de4f7008fb",
              "value": "public cadence verified"
            },
            {
              "id": "criterion-07-evidence-02",
              "kind": "cadence-verification",
              "artifact": "projects/tanisea-lyric-film/work/qa/run-1/logs/verify-proof.log",
              "sha256": "b8aac99121411a632b97e739e39ab88ec311a323743522bf9b96d465ea9179e4",
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
              "sha256": "f5ac49d57879417d0d4df8060951909490619f40d7e9f938845b19fe2d996f84",
              "value": "criterion 8 verified"
            },
            {
              "id": "criterion-08-evidence-02",
              "kind": "encoded-frame",
              "artifact": "projects/tanisea-lyric-film/work/qa/run-1/selected-frames/chrome.png",
              "sha256": "6ba12eacae3662a70466c62cdf7689b3560c5e784a494c84354c8eb1d77b2706",
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
              "sha256": "0f562b48e1cbc8ed96ee173dcf2fedd3141fb12c9d780f9b799e7c1fc224808f",
              "value": "criterion 9 verified"
            },
            {
              "id": "criterion-09-evidence-02",
              "kind": "encoded-frame",
              "artifact": "projects/tanisea-lyric-film/work/qa/run-1/selected-frames/safe-area.png",
              "sha256": "95e7ca4fb018032d54ad467648bf316e594bf901abe5076c23826ea64a4ac044",
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
              "sha256": "dfbafb175e26320640b583956bf34dc730f1ce9a19f26666bf97cd8208767b86",
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
        "sha256": "6ba12eacae3662a70466c62cdf7689b3560c5e784a494c84354c8eb1d77b2706"
      },
      {
        "id": "handoff",
        "artifactId": "public-handoff-still",
        "composition": "LyricFilmVNext",
        "frame": 7079,
        "path": "projects/tanisea-lyric-film/work/qa/run-1/selected-frames/handoff.png",
        "sha256": "a759e35419a6fdb0d06d19a1d258faaa7eb02a4825710f6215bc48f601b56bbe"
      },
      {
        "id": "focus",
        "artifactId": "public-focus-still",
        "composition": "LyricFilmVNext",
        "frame": 4355,
        "path": "projects/tanisea-lyric-film/work/qa/run-1/selected-frames/focus.png",
        "sha256": "4df27b5ed8f51b8e7b297e49e75bd0d2d1f6093cc3ae5104ac5ba5760ca82222"
      },
      {
        "id": "safe-area",
        "artifactId": "public-safe-area-still",
        "composition": "LyricFilmVNext",
        "frame": 4458,
        "path": "projects/tanisea-lyric-film/work/qa/run-1/selected-frames/safe-area.png",
        "sha256": "95e7ca4fb018032d54ad467648bf316e594bf901abe5076c23826ea64a4ac044"
      },
      {
        "id": "spectrum-peak",
        "artifactId": "public-spectrum-peak-still",
        "composition": "LyricFilmVNext",
        "frame": 2306,
        "path": "projects/tanisea-lyric-film/work/qa/run-1/selected-frames/spectrum-peak.png",
        "sha256": "c6082845631d75c74037dc11a0607ab38b14ad7d620f38938d0a990b39011a64"
      },
      {
        "id": "backward-contact",
        "artifactId": "proof-backward-contact-still",
        "composition": "LyricFilmSyncProof",
        "frame": 10394,
        "path": "projects/tanisea-lyric-film/work/qa/run-1/selected-frames/backward-contact.png",
        "sha256": "80be86a8d418fa922d7c82d7fa961aa4376559e5a79e58b25e0a163e08439388"
      },
      {
        "id": "final-transition",
        "artifactId": "reference-transition-still",
        "composition": "LyricFilmVNext",
        "frame": 7092,
        "path": "projects/tanisea-lyric-film/work/qa/run-1/selected-frames/final-transition.png",
        "sha256": "b877fd90c4fc8991b192c36b88ec959fbe32720d8f5e9497c074f6f1f907f03e"
      }
    ]
  },
  "authoritativeRun": {
    "schemaVersion": 1,
    "runId": "run-2",
    "fullMediaExecuted": true,
    "boundedClaim": "sample-indexed alignment with frame-bounded rendering",
    "git": {
      "headCommit": "99b28cef7db6069b64790038e3369f1f0d5d124e",
      "trackedTreeSha256": "b8fb2c47a66eabd9acd04cd6d98d66de5eddaa70abc6a8155b187165287ee5e0",
      "worktreeDiffSha256": "e3d59ea21a123e922d00002012b719550baf3d12ae662094e8d33007e31628a2",
      "isClean": false,
      "statusEntries": [
        "projects/tanisea-lyric-film/package.json",
        "projects/tanisea-lyric-film/public/audio-features.bin",
        "projects/tanisea-lyric-film/public/audio-features.manifest.json",
        "projects/tanisea-lyric-film/scripts/audio-feature-commands.ts",
        "projects/tanisea-lyric-film/scripts/encode-delivery-plan.ts",
        "projects/tanisea-lyric-film/scripts/encode-delivery.ts",
        "projects/tanisea-lyric-film/scripts/generate-audio-features.ts",
        "projects/tanisea-lyric-film/scripts/make-platform-delivery.ts",
        "projects/tanisea-lyric-film/scripts/normalize-reference.ts",
        "projects/tanisea-lyric-film/scripts/project-root.ts",
        "projects/tanisea-lyric-film/scripts/release-gates.ts",
        "projects/tanisea-lyric-film/scripts/render-qa-clips.ts",
        "projects/tanisea-lyric-film/scripts/run-release-qa.ts",
        "projects/tanisea-lyric-film/scripts/verify-delivery.ts",
        "projects/tanisea-lyric-film/tests/audio-feature-commands.test.ts",
        "projects/tanisea-lyric-film/tests/encode-delivery-plan.test.ts",
        "projects/tanisea-lyric-film/tests/media-tool-root-regressions.test.ts",
        "projects/tanisea-lyric-film/tests/project-root.test.ts",
        "projects/tanisea-lyric-film/tests/qa-clips.test.ts",
        "projects/tanisea-lyric-film/tests/reference-normalization.test.ts",
        "projects/tanisea-lyric-film/tests/release-gates.test.ts",
        "projects/tanisea-lyric-film/tests/release-integration.test.ts",
        "projects/tanisea-lyric-film/tests/release-package-scripts.test.ts",
        "projects/tanisea-lyric-film/tests/release-qa-orchestrator.test.ts"
      ]
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
        "durationMs": 10564.345800000001,
        "logPath": "projects/tanisea-lyric-film/work/qa/run-2/logs/npm-ci.log",
        "logSha256": "136e9e76e76123cf294769cb38e687692c7f7a942063dbc45a41f9a4feca6d4f"
      },
      {
        "id": "check",
        "command": "npm run check",
        "exitCode": 0,
        "durationMs": 53919.807799999995,
        "logPath": "projects/tanisea-lyric-film/work/qa/run-2/logs/check.log",
        "logSha256": "914c776eb531d16c4ed1686d2121ac2efd8a204608338108663634173191f03d"
      },
      {
        "id": "alignment-verify",
        "command": "npm run alignment:verify",
        "exitCode": 0,
        "durationMs": 944.9570000000022,
        "logPath": "projects/tanisea-lyric-film/work/qa/run-2/logs/alignment-verify.log",
        "logSha256": "2501e0ddfe8c21c066b005ce6db3817a63c342d9bd59342c5bbdc948de28bbbd"
      },
      {
        "id": "layout-verify",
        "command": "npm run layout:verify",
        "exitCode": 0,
        "durationMs": 9734.879199999996,
        "logPath": "projects/tanisea-lyric-film/work/qa/run-2/logs/layout-verify.log",
        "logSha256": "d00022e371367289a8d29022e64fb141f08f629db300829fe23973315efcba40"
      },
      {
        "id": "compositions",
        "command": "npm run compositions",
        "exitCode": 0,
        "durationMs": 3986.390400000004,
        "logPath": "projects/tanisea-lyric-film/work/qa/run-2/logs/compositions.log",
        "logSha256": "5a5eb29ca54ea35f456bdf2acf1624a7fa13c48f995655b6cd40ae66176a66b0"
      },
      {
        "id": "verify-reference",
        "command": "npm run verify -- --kind reference",
        "exitCode": 0,
        "durationMs": 742359.6279,
        "logPath": "projects/tanisea-lyric-film/work/qa/run-2/logs/verify-reference.log",
        "logSha256": "44dd88215fcc96b1641a5b9dea434f619347cb3eae2a8ccaa4feff6c2a1b5913"
      },
      {
        "id": "verify-public",
        "command": "npm run verify -- --kind public",
        "exitCode": 0,
        "durationMs": 22449.058100000024,
        "logPath": "projects/tanisea-lyric-film/work/qa/run-2/logs/verify-public.log",
        "logSha256": "7a06e6251b38f97b161b4750149271611df157006140e528b98bf1ba9387262a"
      },
      {
        "id": "verify-proof",
        "command": "npm run verify -- --kind proof",
        "exitCode": 0,
        "durationMs": 33125.68630000006,
        "logPath": "projects/tanisea-lyric-film/work/qa/run-2/logs/verify-proof.log",
        "logSha256": "279d857d568c66016a197048ad5a93c05cf483ce54b2dd8e55e8c7ff3256bc20"
      },
      {
        "id": "verify-public-markup",
        "command": "npm run test:run -- tests/release-gates.test.ts -t \"public-markup release gate\"",
        "exitCode": 0,
        "durationMs": 1584.1143000000156,
        "logPath": "projects/tanisea-lyric-film/work/qa/run-2/logs/verify-public-markup.log",
        "logSha256": "209b978d59ee5f0a1e0f658656de0fcd6ba1876d0486db0d843f2f1ba0f32f4f"
      },
      {
        "id": "verify-matrix",
        "command": "npm run test:run -- tests/release-gates.test.ts -t \"requirement-matrix release gate\"",
        "exitCode": 0,
        "durationMs": 1212.45140000002,
        "logPath": "projects/tanisea-lyric-film/work/qa/run-2/logs/verify-matrix.log",
        "logSha256": "fa5bcd54dedccc30e95bce9c6e97022ac94ab2d9e7d6936b16cc393460a663c7"
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
        "sizeBytes": 28721088575,
        "sha256": "5f16d78bc0132c89b0b38713a629b1cfef1b080990140d69f9a34ccd453d176d"
      },
      {
        "id": "public-master",
        "kind": "public",
        "path": "projects/tanisea-lyric-film/output/Tanisea-Lyric-Film-vNext-60fps-Archival-Master.mp4",
        "sizeBytes": 21763636,
        "sha256": "dfbafb175e26320640b583956bf34dc730f1ce9a19f26666bf97cd8208767b86"
      },
      {
        "id": "sync-proof",
        "kind": "proof",
        "path": "projects/tanisea-lyric-film/output/Tanisea-Lyric-Film-Sync-Proof-120fps.mp4",
        "sizeBytes": 167627313,
        "sha256": "0897bef71187fe01174b095447f9209951e2baf4cf6b6f65aa9619e775ae8310"
      },
      {
        "id": "qa-media-manifest",
        "kind": "qa-manifest",
        "path": "projects/tanisea-lyric-film/work/qa/media/qa-media-manifest.json",
        "sizeBytes": 22724,
        "sha256": "9e5322ababb2f7a9b1b402e8524fdd2749d71348befaf6b1870bd2101928bff1"
      },
      {
        "id": "v1-03-public-contact",
        "kind": "qa-contact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004224.png",
        "sizeBytes": 3396061,
        "sha256": "64260b138117d104dcd775828389931b3d6149298d1da687e8443ae0a6cf7e7b"
      },
      {
        "id": "v1-03-public-contact-sheet",
        "kind": "qa-contact-sheet",
        "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/v1-03-public.png",
        "sizeBytes": 1730793,
        "sha256": "7953d5875abd18fcc9ced08eba8ae52eb41275f511db55e551af6cf5dc30b86a"
      },
      {
        "id": "v1-03-proof-contact-sheet",
        "kind": "qa-contact-sheet",
        "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/v1-03-proof.png",
        "sizeBytes": 1749845,
        "sha256": "11dc42bae41c72c7b57bf724692be3d08107296f8b042ffbeb1c6a08e711671b"
      },
      {
        "id": "v1-08-public-contact-sheet",
        "kind": "qa-contact-sheet",
        "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/v1-08-public.png",
        "sizeBytes": 1849789,
        "sha256": "40054ae4a9070df783fc988a1cc420dc90ae63cf5397541f63bd7e29c531d370"
      },
      {
        "id": "v1-08-proof-contact-sheet",
        "kind": "qa-contact-sheet",
        "path": "projects/tanisea-lyric-film/work/qa/media/contact-sheets/v1-08-proof.png",
        "sizeBytes": 2436009,
        "sha256": "15d53072b26b28f19ec5e059cc74e5d65f712b67e24821b3b8365e865d9c483c"
      },
      {
        "id": "public-chrome-still",
        "kind": "qa-still",
        "path": "projects/tanisea-lyric-film/work/qa/media/stills/public-chrome.png",
        "sizeBytes": 3355892,
        "sha256": "6ba12eacae3662a70466c62cdf7689b3560c5e784a494c84354c8eb1d77b2706"
      },
      {
        "id": "public-handoff-still",
        "kind": "qa-still",
        "path": "projects/tanisea-lyric-film/work/qa/media/stills/public-handoff.png",
        "sizeBytes": 3191585,
        "sha256": "a759e35419a6fdb0d06d19a1d258faaa7eb02a4825710f6215bc48f601b56bbe"
      },
      {
        "id": "public-focus-still",
        "kind": "qa-still",
        "path": "projects/tanisea-lyric-film/work/qa/media/stills/public-focus.png",
        "sizeBytes": 3099469,
        "sha256": "4df27b5ed8f51b8e7b297e49e75bd0d2d1f6093cc3ae5104ac5ba5760ca82222"
      },
      {
        "id": "public-safe-area-still",
        "kind": "qa-still",
        "path": "projects/tanisea-lyric-film/work/qa/media/stills/public-safe-area.png",
        "sizeBytes": 3219449,
        "sha256": "95e7ca4fb018032d54ad467648bf316e594bf901abe5076c23826ea64a4ac044"
      },
      {
        "id": "public-spectrum-peak-still",
        "kind": "qa-still",
        "path": "projects/tanisea-lyric-film/work/qa/media/stills/public-spectrum-peak.png",
        "sizeBytes": 3381180,
        "sha256": "c6082845631d75c74037dc11a0607ab38b14ad7d620f38938d0a990b39011a64"
      },
      {
        "id": "proof-backward-contact-still",
        "kind": "qa-still",
        "path": "projects/tanisea-lyric-film/work/qa/media/stills/proof-backward-contact.png",
        "sizeBytes": 879241,
        "sha256": "80be86a8d418fa922d7c82d7fa961aa4376559e5a79e58b25e0a163e08439388"
      },
      {
        "id": "reference-transition-still",
        "kind": "qa-still",
        "path": "projects/tanisea-lyric-film/work/qa/media/stills/reference-final-transition.png",
        "sizeBytes": 20658733,
        "sha256": "b877fd90c4fc8991b192c36b88ec959fbe32720d8f5e9497c074f6f1f907f03e"
      },
      {
        "id": "qa-media-artifact-001",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/proof/v1-03-half.mp4",
        "sizeBytes": 1415383,
        "sha256": "1e09a0892f977984166e49b07a97bfe817a8e29f5a5fd635c24d3c1749522e50"
      },
      {
        "id": "qa-media-artifact-002",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/proof/v1-03-normal.mp4",
        "sizeBytes": 1085669,
        "sha256": "b306b3dd1719cceb390c4fbf7a7593c1a8232e56adb4ad5f99fbcb25719bd22e"
      },
      {
        "id": "qa-media-artifact-003",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/proof/v1-08-half.mp4",
        "sizeBytes": 1525568,
        "sha256": "ac4f19aefa31c79d9ee00c72cb785eeeef0b14a806330b6aaf68fa91fe17d6b5"
      },
      {
        "id": "qa-media-artifact-004",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/proof/v1-08-normal.mp4",
        "sizeBytes": 1174397,
        "sha256": "ad9b1606c12b61f4aa440b5a1acc638072c64d02c7338b4746eee32cd43f0bf1"
      },
      {
        "id": "qa-media-artifact-005",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/chorus-1-half.mp4",
        "sizeBytes": 755796,
        "sha256": "aabc3ef83bb60262dd96b0bead0b91da5c7b8b589a68a7cc472e37b12a9b0cf0"
      },
      {
        "id": "qa-media-artifact-006",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/chorus-1-normal.mp4",
        "sizeBytes": 548419,
        "sha256": "2dbb929d139cd31c868153a6f7ca49c9de9218b8937422f6419893b7dcb6b157"
      },
      {
        "id": "qa-media-artifact-007",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/chorus-2-half.mp4",
        "sizeBytes": 737791,
        "sha256": "42c02d32c80180aadc56073802bbfe233433b60955153ba5da7a2fc841337ec0"
      },
      {
        "id": "qa-media-artifact-008",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/chorus-2-normal.mp4",
        "sizeBytes": 537894,
        "sha256": "ffb15181c7bad962690bec949cf82dbb6fda2f2ef1f5cb75eddc673b3a3b2ae7"
      },
      {
        "id": "qa-media-artifact-009",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/final-handoff-half.mp4",
        "sizeBytes": 624104,
        "sha256": "228b989c920bf3f7489862a19db934263fbac4783412f969e82f608e988b19cb"
      },
      {
        "id": "qa-media-artifact-010",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/final-handoff-normal.mp4",
        "sizeBytes": 445230,
        "sha256": "102d24049ac2557e0d7124e24a46d6e5ca7338699d372a852c308f779564d4d7"
      },
      {
        "id": "qa-media-artifact-011",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-01-half.mp4",
        "sizeBytes": 691338,
        "sha256": "8a19e77b7584becac2f30cba695afd9d0dc48ee09543fe8154f836a8cfb45fc1"
      },
      {
        "id": "qa-media-artifact-012",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-01-normal.mp4",
        "sizeBytes": 497085,
        "sha256": "8c15595dc9299d33c71c838bf73d60d8c8f3db420b056806768e21346cac8736"
      },
      {
        "id": "qa-media-artifact-013",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-02-half.mp4",
        "sizeBytes": 646691,
        "sha256": "c3d62b027bd0c58206e26548d3ff5039f576947fc59261927f9a2eccc23c03fe"
      },
      {
        "id": "qa-media-artifact-014",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-02-normal.mp4",
        "sizeBytes": 467193,
        "sha256": "d1cacb4d36435b9f874e46cf7eeb9ff86df8bd92ee458df359075c012fe89d3e"
      },
      {
        "id": "qa-media-artifact-015",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-03-half.mp4",
        "sizeBytes": 576809,
        "sha256": "db1e36732e2562277d21f9e7e2e43c68959016408d6c42377111ce3333ba3f8d"
      },
      {
        "id": "qa-media-artifact-016",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-03-normal.mp4",
        "sizeBytes": 417485,
        "sha256": "878a7dc6b5805a1230be23e006beed9367a64cb6606f78702c73a0ae77812bca"
      },
      {
        "id": "qa-media-artifact-017",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-04-half.mp4",
        "sizeBytes": 674181,
        "sha256": "8b7c59f6d28a28ec371b09fe2e83b0038a741b57757d8f1c13c7127cb748a9c5"
      },
      {
        "id": "qa-media-artifact-018",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-04-normal.mp4",
        "sizeBytes": 478039,
        "sha256": "c6f782626708693b291988a70785f2996181e0e6667a4eb55f526a2ee3b20082"
      },
      {
        "id": "qa-media-artifact-019",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-05-half.mp4",
        "sizeBytes": 755796,
        "sha256": "aabc3ef83bb60262dd96b0bead0b91da5c7b8b589a68a7cc472e37b12a9b0cf0"
      },
      {
        "id": "qa-media-artifact-020",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-05-normal.mp4",
        "sizeBytes": 548419,
        "sha256": "2dbb929d139cd31c868153a6f7ca49c9de9218b8937422f6419893b7dcb6b157"
      },
      {
        "id": "qa-media-artifact-021",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-06-half.mp4",
        "sizeBytes": 708746,
        "sha256": "3a3d2c65773bf66bf6bc846660e7b3d29116d14c8ea615abcf481a89e729eaf0"
      },
      {
        "id": "qa-media-artifact-022",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-06-normal.mp4",
        "sizeBytes": 513166,
        "sha256": "716e0cd1e80e76babff5c2b4be2f3033564a92aa8715fe304aa38154cab6d1d3"
      },
      {
        "id": "qa-media-artifact-023",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-07-half.mp4",
        "sizeBytes": 677383,
        "sha256": "76f498548dce8d9ea3571adab8cf054ca78003f6822a55f333a1a11f70d02fe0"
      },
      {
        "id": "qa-media-artifact-024",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-07-normal.mp4",
        "sizeBytes": 492335,
        "sha256": "c1de59abdb52c6fd679b622403bb3fd1918d2aafc8da22800ea50dfc9338edb9"
      },
      {
        "id": "qa-media-artifact-025",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-08-half.mp4",
        "sizeBytes": 687737,
        "sha256": "539afb6bd33e96cc2390ac840e579bc4612f3a5d8b0ba505b76e7fa2f61c52d8"
      },
      {
        "id": "qa-media-artifact-026",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c1-08-normal.mp4",
        "sizeBytes": 492851,
        "sha256": "4d47a2f563f1679b283f20cd05947b5f717ba3a2afb2da8d860987c588e95a7e"
      },
      {
        "id": "qa-media-artifact-027",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-01-half.mp4",
        "sizeBytes": 618257,
        "sha256": "6878f3ae8f3fe5cf251397bc7c726287e48ae44e4fcb811f4997ca3089470408"
      },
      {
        "id": "qa-media-artifact-028",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-01-normal.mp4",
        "sizeBytes": 436532,
        "sha256": "f48f6942df38040366fc97de363ff09320b6f1b68c84a6895cd70e03cd0d2846"
      },
      {
        "id": "qa-media-artifact-029",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-02-half.mp4",
        "sizeBytes": 662776,
        "sha256": "ef4cef07597890238eee9ac67516518ab8bd4210c0bda85cfcd8b8cd25257c31"
      },
      {
        "id": "qa-media-artifact-030",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-02-normal.mp4",
        "sizeBytes": 481078,
        "sha256": "b148e200e38946b061a21846f2519efef3e04fdc6379a268109544721819f8cc"
      },
      {
        "id": "qa-media-artifact-031",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-03-half.mp4",
        "sizeBytes": 575747,
        "sha256": "776ecd0425f0d67b667654a1749dc17ecbe6cef16edf66df73cc200bdc3e4724"
      },
      {
        "id": "qa-media-artifact-032",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-03-normal.mp4",
        "sizeBytes": 414074,
        "sha256": "58acec28128b3bed138580922ddbe9abd6a214712f19eb776595e334b0ff965f"
      },
      {
        "id": "qa-media-artifact-033",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-04-half.mp4",
        "sizeBytes": 653740,
        "sha256": "3a593a69f8548b2ced36a26a74d5030f5d55a989b177b591a140ae013865e2f2"
      },
      {
        "id": "qa-media-artifact-034",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-04-normal.mp4",
        "sizeBytes": 468372,
        "sha256": "d28348149f1e80117defecf69b6bd342080a232dd759ea340d7c8d0ecd5b969a"
      },
      {
        "id": "qa-media-artifact-035",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-05-half.mp4",
        "sizeBytes": 737791,
        "sha256": "42c02d32c80180aadc56073802bbfe233433b60955153ba5da7a2fc841337ec0"
      },
      {
        "id": "qa-media-artifact-036",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-05-normal.mp4",
        "sizeBytes": 537894,
        "sha256": "ffb15181c7bad962690bec949cf82dbb6fda2f2ef1f5cb75eddc673b3a3b2ae7"
      },
      {
        "id": "qa-media-artifact-037",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-06-half.mp4",
        "sizeBytes": 726141,
        "sha256": "1065954699bd5dcb738edec87cd42b36c7eab1c65ebacbc16358e67413fafd03"
      },
      {
        "id": "qa-media-artifact-038",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-06-normal.mp4",
        "sizeBytes": 520665,
        "sha256": "8a96ce2ae391176ad5410259b8745e710492c2e1dd07e3d35abf3dfc2894ad9c"
      },
      {
        "id": "qa-media-artifact-039",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-07-half.mp4",
        "sizeBytes": 614450,
        "sha256": "1b94d0eb49871a82a7d5645b1a9dff99a29abaaeeeb7439c4b9d857acb572ba6"
      },
      {
        "id": "qa-media-artifact-040",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-07-normal.mp4",
        "sizeBytes": 446127,
        "sha256": "39066806c1e143bf599b0c285692a7c2069975535625d1f24458f417b4855a43"
      },
      {
        "id": "qa-media-artifact-041",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-08-half.mp4",
        "sizeBytes": 613298,
        "sha256": "faaae55ee0b8fa776d6ef4dc87f07c36bf04d25be47408c9a115d02c64199616"
      },
      {
        "id": "qa-media-artifact-042",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-c2-08-normal.mp4",
        "sizeBytes": 441975,
        "sha256": "93d0ef446df00d1df0c7d5fb9f72e854da4e6c2057ec03ed6fe5000befaa9832"
      },
      {
        "id": "qa-media-artifact-043",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-01-half.mp4",
        "sizeBytes": 722974,
        "sha256": "2e72587640eab5523bc3e4dfa261d07f50762b980432968d9c5f069a771b910c"
      },
      {
        "id": "qa-media-artifact-044",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-01-normal.mp4",
        "sizeBytes": 524360,
        "sha256": "2fd0681dd979a3f3961868d7389e81511148a31bc8928863eb6bb111c05198f9"
      },
      {
        "id": "qa-media-artifact-045",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-02-half.mp4",
        "sizeBytes": 644165,
        "sha256": "db31a3e4f522240bedac2fc26cf5e3cce985ac1f841ee72a1b87b4f47f1fad43"
      },
      {
        "id": "qa-media-artifact-046",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-02-normal.mp4",
        "sizeBytes": 460833,
        "sha256": "416354e5b3d17624248c516596b1be0931dd6dd64673f0cd2ff72740368e5cba"
      },
      {
        "id": "qa-media-artifact-047",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-03-half.mp4",
        "sizeBytes": 655534,
        "sha256": "ca09a2fbb71e1e89b14178b4107255920907090ff4a28c38818118e7810603e5"
      },
      {
        "id": "qa-media-artifact-048",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-03-normal.mp4",
        "sizeBytes": 470583,
        "sha256": "2e044c7c3c1b5a1342cecbd00a1da8833eab88fcd520a60c10baa6e4712b3635"
      },
      {
        "id": "qa-media-artifact-049",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-04-half.mp4",
        "sizeBytes": 664304,
        "sha256": "4d67eb2af8ac105130543feac6df5413b8c0966b25197712403828472327d3c5"
      },
      {
        "id": "qa-media-artifact-050",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-04-normal.mp4",
        "sizeBytes": 487114,
        "sha256": "25fee0d0d8fc5fd74cebc8ecd434fe37caec3e4a437116309f390b5f9d6cf629"
      },
      {
        "id": "qa-media-artifact-051",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-05-half.mp4",
        "sizeBytes": 693665,
        "sha256": "930e12d41ccbe798b4917a171f6f4a38b7d852cb05286fb8303166ae89bc9b46"
      },
      {
        "id": "qa-media-artifact-052",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-05-normal.mp4",
        "sizeBytes": 500710,
        "sha256": "ea284eb95dbba233919ac6417cb08216e0bb22dafb4d741502fc6583a6fc0673"
      },
      {
        "id": "qa-media-artifact-053",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-06-half.mp4",
        "sizeBytes": 682953,
        "sha256": "506238461b23a5ae3b570978e84585d3a8822f50543f01110c47786bec640ed6"
      },
      {
        "id": "qa-media-artifact-054",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-06-normal.mp4",
        "sizeBytes": 492265,
        "sha256": "9738b2b8ed28dee427a5471352358427779ecabdc69bf497b88c4c39658b1512"
      },
      {
        "id": "qa-media-artifact-055",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-07-half.mp4",
        "sizeBytes": 658375,
        "sha256": "7d7b55a18b02f069d801858c2207b57265e9f85027dd2b922ba3c5f1e3937fc1"
      },
      {
        "id": "qa-media-artifact-056",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-07-normal.mp4",
        "sizeBytes": 475727,
        "sha256": "c489a6f8c10f5fad083406ac9b7cd2096c7002331684a2c02edcb6a34117cf69"
      },
      {
        "id": "qa-media-artifact-057",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-08-half.mp4",
        "sizeBytes": 667337,
        "sha256": "a1ecc69cc6ea8f88bdb5bf3dae65255549874284c8dac07ec446749f29c515dd"
      },
      {
        "id": "qa-media-artifact-058",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/line-v1-08-normal.mp4",
        "sizeBytes": 483218,
        "sha256": "80b4563f275bb97ee6c93a9cee04e6679351743059525e6a7cbf0ed44892c13d"
      },
      {
        "id": "qa-media-artifact-059",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/v1-03-half.mp4",
        "sizeBytes": 655534,
        "sha256": "ca09a2fbb71e1e89b14178b4107255920907090ff4a28c38818118e7810603e5"
      },
      {
        "id": "qa-media-artifact-060",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/v1-03-normal.mp4",
        "sizeBytes": 470583,
        "sha256": "2e044c7c3c1b5a1342cecbd00a1da8833eab88fcd520a60c10baa6e4712b3635"
      },
      {
        "id": "qa-media-artifact-061",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/v1-08-half.mp4",
        "sizeBytes": 667337,
        "sha256": "a1ecc69cc6ea8f88bdb5bf3dae65255549874284c8dac07ec446749f29c515dd"
      },
      {
        "id": "qa-media-artifact-062",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/clips/public/v1-08-normal.mp4",
        "sizeBytes": 483218,
        "sha256": "80b4563f275bb97ee6c93a9cee04e6679351743059525e6a7cbf0ed44892c13d"
      },
      {
        "id": "qa-media-artifact-063",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008447.png",
        "sizeBytes": 789711,
        "sha256": "1bbce14c18ab93177334f4d84fa1f865620896224c113864bd856ee65fec2829"
      },
      {
        "id": "qa-media-artifact-064",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008448.png",
        "sizeBytes": 947526,
        "sha256": "4365bfc177990eb8b11e6ea97e9aef10076ffdc1a9e9884f81e569ee824aebe2"
      },
      {
        "id": "qa-media-artifact-065",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008449.png",
        "sizeBytes": 937767,
        "sha256": "38c4433877256eb9bf2767871ad012c06bc540dd185a370ea31c67bd3a70d0cb"
      },
      {
        "id": "qa-media-artifact-066",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008450.png",
        "sizeBytes": 944532,
        "sha256": "b6f3ebee69987a430fa1b3e5d97969d9809d6eae7bfec17d2338a78ff8b1e2ac"
      },
      {
        "id": "qa-media-artifact-067",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008635.png",
        "sizeBytes": 733078,
        "sha256": "391ea44ca984930e9d66250a7aedc1fae3a85cbb85648c83711a17f68e661d1f"
      },
      {
        "id": "qa-media-artifact-068",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008636.png",
        "sizeBytes": 857090,
        "sha256": "438d8e2cc5c0982a29607d6e8b260ab5d323a5017760a8f69d9e574952a76a43"
      },
      {
        "id": "qa-media-artifact-069",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008637.png",
        "sizeBytes": 856682,
        "sha256": "52809d3325f0e0836d93bc6366f9e180d5d1264a777dc407f53b0ff2148508dd"
      },
      {
        "id": "qa-media-artifact-070",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008638.png",
        "sizeBytes": 856913,
        "sha256": "0ea9a5a085bf751c6cce8d46340b54e64b865edc9ee3bbfde09363cf0e0f597f"
      },
      {
        "id": "qa-media-artifact-071",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008709.png",
        "sizeBytes": 737339,
        "sha256": "680db0a8924ecc839273d19430f2bf4c05c125395f96b7c9ff0c5c85d7d130d6"
      },
      {
        "id": "qa-media-artifact-072",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008710.png",
        "sizeBytes": 856509,
        "sha256": "fc9d9f712014154d953b75566c503cc47e56e357d49091ee7128cb20e7a3ffa6"
      },
      {
        "id": "qa-media-artifact-073",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008711.png",
        "sizeBytes": 860917,
        "sha256": "c4bc8a2623b5ae7d3b21fc2e7b45c077af918be36b36f4add208f6c0a2015822"
      },
      {
        "id": "qa-media-artifact-074",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/proof/frame-008712.png",
        "sizeBytes": 862797,
        "sha256": "f44e764386d086ab89cbd5426c06db02c3108e9221a27b630ebd06117e751e76"
      },
      {
        "id": "qa-media-artifact-075",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004223.png",
        "sizeBytes": 3335589,
        "sha256": "aa14816d0f995ba41ff245cd680563629e36c0d14c914a72b5fb378cb820bcfe"
      },
      {
        "id": "qa-media-artifact-076",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004225.png",
        "sizeBytes": 3388702,
        "sha256": "99958b512bfa4e3e8e299a1457a30a2771f22a5842bf44ecb0a0759f8bac5561"
      },
      {
        "id": "qa-media-artifact-077",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004226.png",
        "sizeBytes": 3377056,
        "sha256": "ad487b6d0c6cde87290e44b2a25a4221c6e83f05a3dbd929d2a8f3f88b0ab47d"
      },
      {
        "id": "qa-media-artifact-078",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004317.png",
        "sizeBytes": 3101521,
        "sha256": "77120dd1e18ca0da47479b4593ec4e9fd478b3d3fc54749c84e7d96dabe0ca83"
      },
      {
        "id": "qa-media-artifact-079",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004318.png",
        "sizeBytes": 3101376,
        "sha256": "161e00c20169ef938b54414b8359c533a8ec64d971565f27569ac327ecd21200"
      },
      {
        "id": "qa-media-artifact-080",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004319.png",
        "sizeBytes": 3099928,
        "sha256": "c982b8e7193ca8e882f8f884d779164d48fcbe6bc1fadd7cc02ab45723a8fff4"
      },
      {
        "id": "qa-media-artifact-081",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004320.png",
        "sizeBytes": 3107400,
        "sha256": "c867cccdc89475cca08c48774806672deff1a4867be5975fd953b402a035999c"
      },
      {
        "id": "qa-media-artifact-082",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004354.png",
        "sizeBytes": 3093633,
        "sha256": "6810bf0346d24dad7578b63d9ea8399ff86b6824bc146530d77c9ced7779dbed"
      },
      {
        "id": "qa-media-artifact-083",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004355.png",
        "sizeBytes": 3099469,
        "sha256": "4df27b5ed8f51b8e7b297e49e75bd0d2d1f6093cc3ae5104ac5ba5760ca82222"
      },
      {
        "id": "qa-media-artifact-084",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004356.png",
        "sizeBytes": 3110683,
        "sha256": "dfa88d5f745335c5b6be121eb337ce06bcbc59bc090971777b0660606d9861aa"
      },
      {
        "id": "qa-media-artifact-085",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-03/public/frame-004357.png",
        "sizeBytes": 3159051,
        "sha256": "e6c6fde5b953332d05b5e6a32fbff281d5bcf589b2acabfd0713710623a63594"
      },
      {
        "id": "qa-media-artifact-086",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010359.png",
        "sizeBytes": 755782,
        "sha256": "e2bfbfeb833f9ef9ffc55758c22a413218b3e4cee96adec416e67d6f7479fed3"
      },
      {
        "id": "qa-media-artifact-087",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010360.png",
        "sizeBytes": 867194,
        "sha256": "dd5967d883a58a94f7ea85025bd9564a58b4e45905d69d51e499fceeca32c5ae"
      },
      {
        "id": "qa-media-artifact-088",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010361.png",
        "sizeBytes": 871578,
        "sha256": "6cfc9f05a69e40aedfeb794c636941dc28f19cfd4a85b87319d7ac0c6a1bc992"
      },
      {
        "id": "qa-media-artifact-089",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010362.png",
        "sizeBytes": 871788,
        "sha256": "c9b60236df33b8c1bbae3728b7822f8266ce2e54c79b5ca069a79cf90fbc44f9"
      },
      {
        "id": "qa-media-artifact-090",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010392.png",
        "sizeBytes": 747961,
        "sha256": "fe3947d80e3934f530ff070f05c7b57076f0bf0fd379d496efde90504aae54f9"
      },
      {
        "id": "qa-media-artifact-091",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010393.png",
        "sizeBytes": 877865,
        "sha256": "992b016361e1f68d72b3de14bb5585efdedc7b7d8114834dd5f9aa245e9c5ee4"
      },
      {
        "id": "qa-media-artifact-092",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010394.png",
        "sizeBytes": 879241,
        "sha256": "80be86a8d418fa922d7c82d7fa961aa4376559e5a79e58b25e0a163e08439388"
      },
      {
        "id": "qa-media-artifact-093",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010395.png",
        "sizeBytes": 884530,
        "sha256": "7237fc10952759b7a4470fbbda643235f9bc86e8767536464a04989f14be97ba"
      },
      {
        "id": "qa-media-artifact-094",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010529.png",
        "sizeBytes": 721527,
        "sha256": "2b8c64948ba4662c79728457657bccffa400ef016e7f900888e3c55d68b97d8f"
      },
      {
        "id": "qa-media-artifact-095",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010530.png",
        "sizeBytes": 863325,
        "sha256": "deea410909cb8f1178b09418d3e1a6cd513a89465f519203d38c1d1477019ac9"
      },
      {
        "id": "qa-media-artifact-096",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010531.png",
        "sizeBytes": 857016,
        "sha256": "c89cff402254fd7e09911c7ffc2105dc88d7fa1f959cbb4ddb0ca637aa821e86"
      },
      {
        "id": "qa-media-artifact-097",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010532.png",
        "sizeBytes": 859621,
        "sha256": "bb33036bc539ccc80d80d43a520c500c0b8cef1d0c45a9468fd3dfe70aae4c06"
      },
      {
        "id": "qa-media-artifact-098",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010645.png",
        "sizeBytes": 731000,
        "sha256": "0800b9d82435b2435f30cf36f989d7580ffb25b74ce3e6e6408aa75d6fe3e724"
      },
      {
        "id": "qa-media-artifact-099",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010646.png",
        "sizeBytes": 848079,
        "sha256": "e3bb51e9f4a58cf5c82bdefb0447329194d9ec36324135271c52491b41b1d7dc"
      },
      {
        "id": "qa-media-artifact-100",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010647.png",
        "sizeBytes": 855682,
        "sha256": "5f5e3f629f218a8f98f274e95aeb1f0e9179b55fd76a9883878b07c7ec17ab65"
      },
      {
        "id": "qa-media-artifact-101",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/proof/frame-010648.png",
        "sizeBytes": 856130,
        "sha256": "fc4b62bdf500c174446ca29e4141e493657f2bdc0326cbfa59200b9e2dc389be"
      },
      {
        "id": "qa-media-artifact-102",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005179.png",
        "sizeBytes": 3246911,
        "sha256": "4afa33e565e96a88331821413b460179c6fc279d582d3c73d015ccf4acaf2eec"
      },
      {
        "id": "qa-media-artifact-103",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005180.png",
        "sizeBytes": 3259085,
        "sha256": "25a33249415a13874f5f778aad57862ee4fae9dfe546c7962fa40473a05f4c68"
      },
      {
        "id": "qa-media-artifact-104",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005181.png",
        "sizeBytes": 3259942,
        "sha256": "87387ee9245b38f24627ef5913d6ed8af6b21c7cd6086d0304b4655d1f9d4637"
      },
      {
        "id": "qa-media-artifact-105",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005182.png",
        "sizeBytes": 3262372,
        "sha256": "264e0ef8a7b3ce53c164aab87797583864d94bde5c936fbd309d2ef3ca74ec42"
      },
      {
        "id": "qa-media-artifact-106",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005196.png",
        "sizeBytes": 3284835,
        "sha256": "5e8ad5244355cb31f394ccf4bbcf3ba5deb1c8f8cde32b3a3e52aa245605e3a1"
      },
      {
        "id": "qa-media-artifact-107",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005197.png",
        "sizeBytes": 3284563,
        "sha256": "e2eeeff4ed8926f1f042c25503860f4ecaf23e09955b7d5b3ab9a1164a1b9ec5"
      },
      {
        "id": "qa-media-artifact-108",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005198.png",
        "sizeBytes": 3283510,
        "sha256": "5851e0c2dfa91056b64d9ee194b5b4ae4a7abaabc63b2d8efb39e0e99d36c48e"
      },
      {
        "id": "qa-media-artifact-109",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005199.png",
        "sizeBytes": 3275411,
        "sha256": "920bc64d24f25ec406d425bdd5cd814eec044a64e27f64fd22308ec859775495"
      },
      {
        "id": "qa-media-artifact-110",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005264.png",
        "sizeBytes": 3030708,
        "sha256": "1ee70eaea2c60677952719f65613c388778cbba43a918537ecfc592a7362e7c9"
      },
      {
        "id": "qa-media-artifact-111",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005265.png",
        "sizeBytes": 3044990,
        "sha256": "b6cd32de77f6ab4b265214e1528cd7275afb73f18bb578975bebf6f70dfd318a"
      },
      {
        "id": "qa-media-artifact-112",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005266.png",
        "sizeBytes": 3048647,
        "sha256": "130c55c4ef3089651337ca0770507c104d858533a7e5f4080b12c70860229974"
      },
      {
        "id": "qa-media-artifact-113",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005267.png",
        "sizeBytes": 3053892,
        "sha256": "e545d9db7f44e5f393f55bfe48d84a658b605a00a517f267a218c7d8533c22a3"
      },
      {
        "id": "qa-media-artifact-114",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005322.png",
        "sizeBytes": 3143726,
        "sha256": "a7ba7ae11030b6b436efc97ca8ff696eda48c80aff4b9d355b447382cc94ec95"
      },
      {
        "id": "qa-media-artifact-115",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005323.png",
        "sizeBytes": 3160970,
        "sha256": "47e885f8cd1984524007189741946f3cf89dd60f8f9abf7790f9afad8ef834d3"
      },
      {
        "id": "qa-media-artifact-116",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005324.png",
        "sizeBytes": 3165131,
        "sha256": "58a1c0d40d14256378329fc717d52c314373d02815a1299392843211e01211c6"
      },
      {
        "id": "qa-media-artifact-117",
        "kind": "qa-media-artifact",
        "path": "projects/tanisea-lyric-film/work/qa/media/contacts/v1-08/public/frame-005325.png",
        "sizeBytes": 3155238,
        "sha256": "65e3075969336359d2da770e40ac488bbe5664b52d3d800d35a6ed28e14abaa5"
      }
    ],
    "media": {
      "reference": {
        "artifactId": "reference-render",
        "fileSha256": {
          "value": "5f16d78bc0132c89b0b38713a629b1cfef1b080990140d69f9a34ccd453d176d",
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
          "value": "dfbafb175e26320640b583956bf34dc730f1ce9a19f26666bf97cd8208767b86",
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
          "value": "0897bef71187fe01174b095447f9209951e2baf4cf6b6f65aa9619e775ae8310",
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
        "final-handoff"
      ],
      "proofRanges": [
        "v1-03",
        "v1-08"
      ],
      "cueIds": [
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
              "sha256": "914c776eb531d16c4ed1686d2121ac2efd8a204608338108663634173191f03d",
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
              "sha256": "7a06e6251b38f97b161b4750149271611df157006140e528b98bf1ba9387262a",
              "value": "public cadence verified"
            },
            {
              "id": "criterion-07-evidence-02",
              "kind": "cadence-verification",
              "artifact": "projects/tanisea-lyric-film/work/qa/run-2/logs/verify-proof.log",
              "sha256": "279d857d568c66016a197048ad5a93c05cf483ce54b2dd8e55e8c7ff3256bc20",
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
              "sha256": "209b978d59ee5f0a1e0f658656de0fcd6ba1876d0486db0d843f2f1ba0f32f4f",
              "value": "criterion 8 verified"
            },
            {
              "id": "criterion-08-evidence-02",
              "kind": "encoded-frame",
              "artifact": "projects/tanisea-lyric-film/work/qa/run-2/selected-frames/chrome.png",
              "sha256": "6ba12eacae3662a70466c62cdf7689b3560c5e784a494c84354c8eb1d77b2706",
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
              "sha256": "d00022e371367289a8d29022e64fb141f08f629db300829fe23973315efcba40",
              "value": "criterion 9 verified"
            },
            {
              "id": "criterion-09-evidence-02",
              "kind": "encoded-frame",
              "artifact": "projects/tanisea-lyric-film/work/qa/run-2/selected-frames/safe-area.png",
              "sha256": "95e7ca4fb018032d54ad467648bf316e594bf901abe5076c23826ea64a4ac044",
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
              "sha256": "dfbafb175e26320640b583956bf34dc730f1ce9a19f26666bf97cd8208767b86",
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
        "sha256": "6ba12eacae3662a70466c62cdf7689b3560c5e784a494c84354c8eb1d77b2706"
      },
      {
        "id": "handoff",
        "artifactId": "public-handoff-still",
        "composition": "LyricFilmVNext",
        "frame": 7079,
        "path": "projects/tanisea-lyric-film/work/qa/run-2/selected-frames/handoff.png",
        "sha256": "a759e35419a6fdb0d06d19a1d258faaa7eb02a4825710f6215bc48f601b56bbe"
      },
      {
        "id": "focus",
        "artifactId": "public-focus-still",
        "composition": "LyricFilmVNext",
        "frame": 4355,
        "path": "projects/tanisea-lyric-film/work/qa/run-2/selected-frames/focus.png",
        "sha256": "4df27b5ed8f51b8e7b297e49e75bd0d2d1f6093cc3ae5104ac5ba5760ca82222"
      },
      {
        "id": "safe-area",
        "artifactId": "public-safe-area-still",
        "composition": "LyricFilmVNext",
        "frame": 4458,
        "path": "projects/tanisea-lyric-film/work/qa/run-2/selected-frames/safe-area.png",
        "sha256": "95e7ca4fb018032d54ad467648bf316e594bf901abe5076c23826ea64a4ac044"
      },
      {
        "id": "spectrum-peak",
        "artifactId": "public-spectrum-peak-still",
        "composition": "LyricFilmVNext",
        "frame": 2306,
        "path": "projects/tanisea-lyric-film/work/qa/run-2/selected-frames/spectrum-peak.png",
        "sha256": "c6082845631d75c74037dc11a0607ab38b14ad7d620f38938d0a990b39011a64"
      },
      {
        "id": "backward-contact",
        "artifactId": "proof-backward-contact-still",
        "composition": "LyricFilmSyncProof",
        "frame": 10394,
        "path": "projects/tanisea-lyric-film/work/qa/run-2/selected-frames/backward-contact.png",
        "sha256": "80be86a8d418fa922d7c82d7fa961aa4376559e5a79e58b25e0a163e08439388"
      },
      {
        "id": "final-transition",
        "artifactId": "reference-transition-still",
        "composition": "LyricFilmVNext",
        "frame": 7092,
        "path": "projects/tanisea-lyric-film/work/qa/run-2/selected-frames/final-transition.png",
        "sha256": "b877fd90c4fc8991b192c36b88ec959fbe32720d8f5e9497c074f6f1f907f03e"
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
      "final-handoff"
    ],
    "proofRanges": [
      "v1-03",
      "v1-08"
    ],
    "cueIds": [
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
        "value": "5f16d78bc0132c89b0b38713a629b1cfef1b080990140d69f9a34ccd453d176d",
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
        "value": "dfbafb175e26320640b583956bf34dc730f1ce9a19f26666bf97cd8208767b86",
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
        "value": "0897bef71187fe01174b095447f9209951e2baf4cf6b6f65aa9619e775ae8310",
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
      "sha256": "a6fb2209868ceb69a2a5ef131744ad1298342bbd3d71942f7499d426219c971e"
    },
    {
      "runId": "run-2",
      "path": "projects/tanisea-lyric-film/work/qa/run-2/qa-run.json",
      "sha256": "69335465a9b430b97ebba7c707a7aa698446f46518a700d2f9d9ec562d4ba422"
    }
  ],
  "comparison": {
    "matched": true,
    "authoritativeRunId": "run-2",
    "recordPath": "projects/tanisea-lyric-film/work/qa/run-2/run-comparison.json",
    "unexplainedDrift": [],
    "recordSha256": "2c0d5fe5e46d565263caa2d15bee3bc81fc1fa0e738dcae973d9f4c571b754ed"
  }
}
```
