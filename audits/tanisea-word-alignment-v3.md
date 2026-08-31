# Tanisea reviewed word alignment v3

Public characterization: **sample-indexed alignment with frame-bounded rendering**.

## Audio identity and geometry

| Property | Value |
|---|---|
| Locked source asset SHA-256 | `93084f293d491da1519732f3fa3cf6416c783d04e8ca18b5569c7608a8d4540d` |
| Deterministic decoded WAV SHA-256 | `8930c4cc58dea9ffaaab9245ca9c30ab34ece45d07e707d8bf64314548ab45bf` |
| Raw evidence SHA-256 | `dfd6277910dec45a1e25a140c5e5be2ae182e95bbc2b09b6898d2935a0b277e5` |
| Transcript authority SHA-256 | `91c073a71b0190d543e0f0b8177649ae60fd1d3f1f1c7cc3dd280260be34eca1` |
| Sample rate | 44,100 Hz |
| Channels | 2 |
| Decoded samples per channel | 6,747,584 |
| Decode duration | 153.006440 s |
| Decode geometry | Manual decoder-skip handling; 1,600 leading samples removed; 284 samples beyond container duration retained by the locked policy |
| Vocal stem SHA-256 | `86953a5d01e186abea44c9a8cfa88af061e016115cc2cf22d62f350f92959c62` |
| Vocal-stem latency compensation | 0 samples at all three accepted anchors |

## Evidence and adjudication method

MFA 3.4.2 with `russian_mfa` supplied 81 intervals across 19 lines. WhisperX 3.8.6 with `large-v3` on CUDA/float16 supplied timestamp candidates; recognition text was never transcript authority. Demucs 4.1.0 with `htdemucs_ft --shifts=5` supplied the zero-lag vocal stem. FFmpeg/FFprobe 9.0 supplied locked decoding and probes.

Each of the 102 transcript-authority tokens was reviewed at both boundaries using ±250 ms original-mix and vocal-stem waveforms and spectrograms. The selected onset is the first meaningful audible phoneme; the selected offset is the final meaningful audible phoneme. MFA and WhisperX values remain candidate evidence only. Recognition substitutions are stated in token evidence, the unmatched false final WhisperX phrase is excluded, and no timing was copied between chorus performances.

The reviewed manifest contains 24 lines, 102 source tokens, 74 stationary English segments, and 74 semantic cues. Maximum resolved token uncertainty is 882 samples (20.000 ms). Maximum candidate-method spread is 161803 samples (3669.002 ms) at `C2-08-R01`; 80 MFA-backed tokens exceeded 25 ms and received dual-source manual adjudication.

## Reviewed source tokens

All times are source-relative. A missing spread means MFA produced no interval for the line.

| Line | Token | Russian | Selected samples | Selected milliseconds | Method spread | Uncertainty | Confidence | Evidence methods |
|---|---|---|---:|---:|---:|---:|---|---|
| C1-01 | `C1-01-R01` | а | 1066955–1070483 | 24193.991–24273.991 ms | 2029 / 46.009 ms | 441 / 10.000 ms | high | mfa, whisperx, waveform, spectrogram, manual-review |
| C1-01 | `C1-01-R02` | я | 1073129–1077539 | 24333.991–24433.991 ms | 5557 / 126.009 ms | 441 / 10.000 ms | high | mfa, whisperx, waveform, spectrogram, manual-review |
| C1-01 | `C1-01-R03` | сотру | 1081067–1097825 | 24513.991–24893.991 ms | 6350 / 143.991 ms | 441 / 10.000 ms | high | mfa, whisperx, waveform, spectrogram, manual-review |
| C1-01 | `C1-01-R04` | горизонт | 1100471–1124991 | 24953.991–25510.000 ms | 73471 / 1666.009 ms | 441 / 10.000 ms | high | mfa, whisperx, waveform, spectrogram, manual-review |
| C1-02 | `C1-02-R01` | и | 1219674–1224966 | 27657.007–27777.007 ms | 19272 / 437.007 ms | 882 / 20.000 ms | medium | mfa, whisperx, waveform, spectrogram, manual-review |
| C1-02 | `C1-02-R02` | разобью | 1225848–1241724 | 27797.007–28157.007 ms | 26769 / 607.007 ms | 882 / 20.000 ms | medium | mfa, whisperx, waveform, spectrogram, manual-review |
| C1-02 | `C1-02-R03` | пополам | 1243488–1332702 | 28197.007–30220.000 ms | 79953 / 1812.993 ms | 882 / 20.000 ms | medium | mfa, whisperx, waveform, spectrogram, manual-review |
| C1-03 | `C1-03-R01` | сверну | 1346638–1372700 | 30536.009–31126.984 ms | 54860 / 1243.991 ms | 882 / 20.000 ms | medium | mfa, whisperx, waveform, spectrogram, manual-review |
| C1-03 | `C1-03-R02` | вершины | 1372700–1398764 | 31126.984–31718.005 ms | 61916 / 1403.991 ms | 882 / 20.000 ms | medium | mfa, whisperx, waveform, spectrogram, manual-review |
| C1-03 | `C1-03-R03` | всех | 1400528–1405820 | 31758.005–31878.005 ms | 75058 / 1701.995 ms | 882 / 20.000 ms | medium | mfa, whisperx, waveform, spectrogram, manual-review |
| C1-03 | `C1-03-R04` | гор | 1407584–1487052 | 31918.005–33720.000 ms | 74617 / 1691.995 ms | 882 / 20.000 ms | medium | mfa, whisperx, waveform, spectrogram, manual-review |
| C1-04 | `C1-04-R01` | и | 1491462–1494108 | 33820.000–33880.000 ms | 8820 / 200.000 ms | 882 / 20.000 ms | medium | mfa, whisperx, waveform, spectrogram, manual-review |
| C1-04 | `C1-04-R02` | подниму | 1497636–1525904 | 33960.000–34600.998 ms | 25622 / 580.998 ms | 882 / 20.000 ms | medium | mfa, whisperx, waveform, spectrogram, manual-review |
| C1-04 | `C1-04-R03` | океан | 1528550–1628348 | 34660.998–36923.991 ms | 121892 / 2763.991 ms | 882 / 20.000 ms | medium | mfa, whisperx, waveform, spectrogram, manual-review |
| C1-05 | `C1-05-R01` | я | 1631876–1638932 | 37003.991–37163.991 ms | 19228 / 436.009 ms | 882 / 20.000 ms | medium | mfa, whisperx, waveform, spectrogram, manual-review |
| C1-05 | `C1-05-R02` | закричу | 1639814–1659263 | 37183.991–37625.011 ms | 14377 / 326.009 ms | 882 / 20.000 ms | medium | mfa, whisperx, waveform, spectrogram, manual-review |
| C1-05 | `C1-05-R03` | на | 1660145–1672492 | 37645.011–37924.989 ms | 32413 / 734.989 ms | 882 / 20.000 ms | medium | mfa, whisperx, waveform, spectrogram, manual-review |
| C1-05 | `C1-05-R04` | весь | 1674257–1698000 | 37965.011–38503.401 ms | 96932 / 2198.005 ms | 882 / 20.000 ms | medium | mfa, whisperx, waveform, spectrogram, manual-review |
| C1-05 | `C1-05-R05` | мир | 1698000–1795223 | 38503.401–40708.005 ms | 92963 / 2108.005 ms | 882 / 20.000 ms | medium | mfa, whisperx, waveform, spectrogram, manual-review |
| C1-06 | `C1-06-R01` | пусть | 1796987–1814671 | 40748.005–41149.002 ms | MFA unavailable | 882 / 20.000 ms | medium | whisperx, waveform, spectrogram, manual-review |
| C1-06 | `C1-06-R02` | содрогнётся | 1818199–1931227 | 41229.002–43791.995 ms | MFA unavailable | 882 / 20.000 ms | medium | whisperx, waveform, spectrogram, manual-review |
| C1-06 | `C1-06-R03` | земля | 1936519–1971843 | 43911.995–44712.993 ms | MFA unavailable | 882 / 20.000 ms | medium | whisperx, waveform, spectrogram, manual-review |
| C1-07 | `C1-07-R01` | и | 1974489–1975371 | 44772.993–44792.993 ms | MFA unavailable | 882 / 20.000 ms | medium | whisperx, waveform, spectrogram, manual-review |
| C1-07 | `C1-07-R02` | через | 1978017–2012459 | 44852.993–45633.991 ms | MFA unavailable | 882 / 20.000 ms | medium | whisperx, waveform, spectrogram, manual-review |
| C1-07 | `C1-07-R03` | стены | 2013341–2046020 | 45653.991–46395.011 ms | MFA unavailable | 882 / 20.000 ms | medium | whisperx, waveform, spectrogram, manual-review |
| C1-07 | `C1-07-R04` | квартир | 2046902–2063660 | 46415.011–46795.011 ms | MFA unavailable | 882 / 20.000 ms | medium | whisperx, waveform, spectrogram, manual-review |
| C1-08 | `C1-08-R01` | пройдусь | 2064542–2078698 | 46815.011–47136.009 ms | 46084 / 1044.989 ms | 882 / 20.000 ms | medium | mfa, whisperx, waveform, spectrogram, manual-review |
| C1-08 | `C1-08-R02` | волною | 2080462–2096338 | 47176.009–47536.009 ms | 39425 / 893.991 ms | 882 / 20.000 ms | medium | mfa, whisperx, waveform, spectrogram, manual-review |
| C1-08 | `C1-08-R03` | огня | 2098102–2171396 | 47576.009–49238.005 ms | 36956 / 838.005 ms | 882 / 20.000 ms | medium | mfa, whisperx, waveform, spectrogram, manual-review |
| V1-01 | `V1-01-R01` | ночь | 2818784–2834660 | 63918.005–64278.005 ms | 8732 / 198.005 ms | 441 / 10.000 ms | high | mfa, whisperx, waveform, spectrogram, manual-review |
| V1-01 | `V1-01-R02` | в | 2835542–2836424 | 64298.005–64318.005 ms | 63592 / 1441.995 ms | 441 / 10.000 ms | high | mfa, whisperx, waveform, spectrogram, manual-review |
| V1-01 | `V1-01-R03` | тишине | 2837306–2872630 | 64338.005–65139.002 ms | 62710 / 1421.995 ms | 441 / 10.000 ms | high | mfa, whisperx, waveform, spectrogram, manual-review |
| V1-01 | `V1-01-R04` | застывает | 2873512–2914966 | 65159.002–66099.002 ms | 36647 / 830.998 ms | 441 / 10.000 ms | high | mfa, whisperx, waveform, spectrogram, manual-review |
| V1-01 | `V1-01-R05` | безвольно | 2916730–2958228 | 66139.002–67080.000 ms | 5777 / 130.998 ms | 441 / 10.000 ms | high | mfa, whisperx, waveform, spectrogram, manual-review |
| V1-02 | `V1-02-R01` | небо | 2961756–2983806 | 67160.000–67660.000 ms | 17640 / 400.000 ms | 441 / 10.000 ms | high | mfa, whisperx, waveform, spectrogram, manual-review |
| V1-02 | `V1-02-R02` | провисло | 2986452–3021776 | 67720.000–68520.998 ms | 59932 / 1359.002 ms | 441 / 10.000 ms | high | mfa, whisperx, waveform, spectrogram, manual-review |
| V1-02 | `V1-02-R03` | немым | 3024422–3042062 | 68580.998–68980.998 ms | 57286 / 1299.002 ms | 441 / 10.000 ms | high | mfa, whisperx, waveform, spectrogram, manual-review |
| V1-02 | `V1-02-R04` | потолком | 3044708–3103846 | 69040.998–70381.995 ms | 47584 / 1079.002 ms | 441 / 10.000 ms | high | mfa, whisperx, waveform, spectrogram, manual-review |
| V1-03 | `V1-03-R01` | помню | 3104728–3124132 | 70401.995–70841.995 ms | 3175 / 71.995 ms | 441 / 10.000 ms | high | mfa, whisperx, waveform, spectrogram, manual-review |
| V1-03 | `V1-03-R02` | что | 3125896–3136480 | 70881.995–71121.995 ms | 7585 / 171.995 ms | 441 / 10.000 ms | high | mfa, whisperx, waveform, spectrogram, manual-review |
| V1-03 | `V1-03-R03` | было | 3139126–3165630 | 71181.995–71782.993 ms | 22623 / 512.993 ms | 441 / 10.000 ms | high | mfa, whisperx, waveform, spectrogram, manual-review |
| V1-03 | `V1-03-R04` | и | 3168276–3171804 | 71842.993–71922.993 ms | 25269 / 572.993 ms | 441 / 10.000 ms | high | mfa, whisperx, waveform, spectrogram, manual-review |
| V1-03 | `V1-03-R05` | гложут | 3173568–3199146 | 71962.993–72542.993 ms | 12216 / 277.007 ms | 441 / 10.000 ms | high | mfa, whisperx, waveform, spectrogram, manual-review |
| V1-03 | `V1-03-R06` | вопросы | 3200910–3236234 | 72582.993–73383.991 ms | 10452 / 237.007 ms | 441 / 10.000 ms | high | mfa, whisperx, waveform, spectrogram, manual-review |
| V1-04 | `V1-04-R01` | кто | 3238880–3255638 | 73443.991–73823.991 ms | 7762 / 176.009 ms | 441 / 10.000 ms | high | mfa, whisperx, waveform, spectrogram, manual-review |
| V1-04 | `V1-04-R02` | я | 3259166–3278570 | 73903.991–74343.991 ms | 16052 / 363.991 ms | 441 / 10.000 ms | high | mfa, whisperx, waveform, spectrogram, manual-review |
| V1-04 | `V1-04-R03` | откуда | 3282980–3305912 | 74443.991–74963.991 ms | 11201 / 253.991 ms | 441 / 10.000 ms | high | mfa, whisperx, waveform, spectrogram, manual-review |
| V1-04 | `V1-04-R04` | и | 3306839–3310367 | 74985.011–75065.011 ms | 13451 / 305.011 ms | 441 / 10.000 ms | high | mfa, whisperx, waveform, spectrogram, manual-review |
| V1-04 | `V1-04-R05` | где | 3311248–3322715 | 75084.989–75345.011 ms | 13010 / 295.011 ms | 441 / 10.000 ms | high | mfa, whisperx, waveform, spectrogram, manual-review |
| V1-04 | `V1-04-R06` | же | 3328007–3340355 | 75465.011–75745.011 ms | 7718 / 175.011 ms | 441 / 10.000 ms | high | mfa, whisperx, waveform, spectrogram, manual-review |
| V1-04 | `V1-04-R07` | мой | 3342119–3348293 | 75785.011–75925.011 ms | 9482 / 215.011 ms | 441 / 10.000 ms | high | mfa, whisperx, waveform, spectrogram, manual-review |
| V1-04 | `V1-04-R08` | дом | 3350057–3388027 | 75965.011–76826.009 ms | 9526 / 216.009 ms | 441 / 10.000 ms | high | mfa, whisperx, waveform, spectrogram, manual-review |
| V1-05 | `V1-05-R01` | сущность | 3390673–3413605 | 76886.009–77406.009 ms | 6880 / 156.009 ms | 441 / 10.000 ms | high | mfa, whisperx, waveform, spectrogram, manual-review |
| V1-05 | `V1-05-R02` | моя | 3417133–3438301 | 77486.009–77966.009 ms | 9967 / 226.009 ms | 441 / 10.000 ms | high | mfa, whisperx, waveform, spectrogram, manual-review |
| V1-05 | `V1-05-R03` | проходила | 3441829–3478917 | 78046.009–78887.007 ms | 3704 / 83.991 ms | 441 / 10.000 ms | high | mfa, whisperx, waveform, spectrogram, manual-review |
| V1-05 | `V1-05-R04` | по | 3481563–3486855 | 78947.007–79067.007 ms | 6042 / 137.007 ms | 441 / 10.000 ms | high | mfa, whisperx, waveform, spectrogram, manual-review |
| V1-05 | `V1-05-R05` | краю | 3489501–3523017 | 79127.007–79887.007 ms | 8688 / 197.007 ms | 441 / 10.000 ms | high | mfa, whisperx, waveform, spectrogram, manual-review |
| V1-06 | `V1-06-R01` | руки | 3529191–3545993 | 80027.007–80408.005 ms | 7409 / 168.005 ms | 441 / 10.000 ms | high | mfa, whisperx, waveform, spectrogram, manual-review |
| V1-06 | `V1-06-R02` | дрожали | 3548639–3584801 | 80468.005–81288.005 ms | 35633 / 808.005 ms | 441 / 10.000 ms | high | mfa, whisperx, waveform, spectrogram, manual-review |
| V1-06 | `V1-06-R03` | от | 3587447–3590975 | 81348.005–81428.005 ms | 39161 / 888.005 ms | 441 / 10.000 ms | high | mfa, whisperx, waveform, spectrogram, manual-review |
| V1-06 | `V1-06-R04` | тяжести | 3595385–3630709 | 81528.005–82329.002 ms | 43571 / 988.005 ms | 441 / 10.000 ms | high | mfa, whisperx, waveform, spectrogram, manual-review |
| V1-06 | `V1-06-R05` | лет | 3633355–3661579 | 82389.002–83029.002 ms | 16361 / 370.998 ms | 441 / 10.000 ms | high | mfa, whisperx, waveform, spectrogram, manual-review |
| V1-07 | `V1-07-R01` | одни | 3662461–3680983 | 83049.002–83469.002 ms | 74573 / 1690.998 ms | 441 / 10.000 ms | high | mfa, whisperx, waveform, spectrogram, manual-review |
| V1-07 | `V1-07-R02` | говорили | 3683629–3726891 | 83529.002–84510.000 ms | 73250 / 1660.998 ms | 441 / 10.000 ms | high | mfa, whisperx, waveform, spectrogram, manual-review |
| V1-07 | `V1-07-R03` | другие | 3728655–3761333 | 84550.000–85290.998 ms | 37044 / 840.000 ms | 441 / 10.000 ms | high | mfa, whisperx, waveform, spectrogram, manual-review |
| V1-07 | `V1-07-R04` | молчали | 3763979–3804551 | 85350.998–86270.998 ms | 15391 / 349.002 ms | 441 / 10.000 ms | high | mfa, whisperx, waveform, spectrogram, manual-review |
| V1-08 | `V1-08-R01` | а | 3805433–3806315 | 86290.998–86310.998 ms | MFA unavailable | 441 / 10.000 ms | high | whisperx, waveform, spectrogram, manual-review |
| V1-08 | `V1-08-R02` | кто | 3807197–3817781 | 86330.998–86570.998 ms | MFA unavailable | 441 / 10.000 ms | high | whisperx, waveform, spectrogram, manual-review |
| V1-08 | `V1-08-R03` | за | 3819545–3828365 | 86610.998–86810.998 ms | MFA unavailable | 441 / 10.000 ms | high | whisperx, waveform, spectrogram, manual-review |
| V1-08 | `V1-08-R04` | спиною | 3831893–3868099 | 86890.998–87711.995 ms | MFA unavailable | 441 / 10.000 ms | high | whisperx, waveform, spectrogram, manual-review |
| V1-08 | `V1-08-R05` | не | 3869863–3873391 | 87751.995–87831.995 ms | MFA unavailable | 441 / 10.000 ms | high | whisperx, waveform, spectrogram, manual-review |
| V1-08 | `V1-08-R06` | сдерживал | 3875155–3910435 | 87871.995–88671.995 ms | MFA unavailable | 441 / 10.000 ms | high | whisperx, waveform, spectrogram, manual-review |
| V1-08 | `V1-08-R07` | смех | 3912243–3949287 | 88712.993–89552.993 ms | MFA unavailable | 441 / 10.000 ms | high | whisperx, waveform, spectrogram, manual-review |
| C2-01 | `C2-01-R01` | а | 4031225–4033871 | 91410.998–91470.998 ms | 3484 / 79.002 ms | 882 / 20.000 ms | medium | mfa, whisperx, waveform, spectrogram, manual-review |
| C2-01 | `C2-01-R02` | я | 4035635–4039163 | 91510.998–91590.998 ms | 485 / 10.998 ms | 882 / 20.000 ms | medium | mfa, whisperx, waveform, spectrogram, manual-review |
| C2-01 | `C2-01-R03` | сотру | 4040045–4061213 | 91610.998–92090.998 ms | 15920 / 360.998 ms | 882 / 20.000 ms | medium | mfa, whisperx, waveform, spectrogram, manual-review |
| C2-01 | `C2-01-R04` | горизонт | 4062977–4169743 | 92130.998–94551.995 ms | 17684 / 400.998 ms | 882 / 20.000 ms | medium | mfa, whisperx, waveform, spectrogram, manual-review |
| C2-02 | `C2-02-R01` | и | 4175917–4178563 | 94691.995–94751.995 ms | 6262 / 141.995 ms | 882 / 20.000 ms | medium | mfa, whisperx, waveform, spectrogram, manual-review |
| C2-02 | `C2-02-R02` | разобью | 4181209–4204185 | 94811.995–95332.993 ms | 7188 / 162.993 ms | 882 / 20.000 ms | medium | mfa, whisperx, waveform, spectrogram, manual-review |
| C2-02 | `C2-02-R03` | пополам | 4205949–4307423 | 95372.993–97673.991 ms | 97196 / 2203.991 ms | 882 / 20.000 ms | medium | mfa, whisperx, waveform, spectrogram, manual-review |
| C2-03 | `C2-03-R01` | сверну | 4310069–4321535 | 97733.991–97993.991 ms | 109192 / 2476.009 ms | 882 / 20.000 ms | medium | mfa, whisperx, waveform, spectrogram, manual-review |
| C2-03 | `C2-03-R02` | вершины | 4323299–4333883 | 98033.991–98273.991 ms | 103018 / 2336.009 ms | 882 / 20.000 ms | medium | mfa, whisperx, waveform, spectrogram, manual-review |
| C2-03 | `C2-03-R03` | всех | 4334765–4339175 | 98293.991–98393.991 ms | 101695 / 2306.009 ms | 882 / 20.000 ms | medium | mfa, whisperx, waveform, spectrogram, manual-review |
| C2-03 | `C2-03-R04` | гор | 4340057–4449249 | 98413.991–100890.000 ms | 100813 / 2286.009 ms | 882 / 20.000 ms | medium | mfa, whisperx, waveform, spectrogram, manual-review |
| C2-04 | `C2-04-R01` | и | 4449249–4461818 | 100890.000–101175.011 ms | 91111 / 2066.009 ms | 882 / 20.000 ms | medium | mfa, whisperx, waveform, spectrogram, manual-review |
| C2-04 | `C2-04-R02` | подниму | 4462700–4486514 | 101195.011–101735.011 ms | 24476 / 555.011 ms | 882 / 20.000 ms | medium | mfa, whisperx, waveform, spectrogram, manual-review |
| C2-04 | `C2-04-R03` | океан | 4491806–4590634 | 101855.011–104096.009 ms | 122863 / 2786.009 ms | 882 / 20.000 ms | medium | mfa, whisperx, waveform, spectrogram, manual-review |
| C2-05 | `C2-05-R01` | я | 4595926–4599498 | 104216.009–104297.007 ms | 4101 / 92.993 ms | 882 / 20.000 ms | medium | mfa, whisperx, waveform, spectrogram, manual-review |
| C2-05 | `C2-05-R02` | закричу | 4603026–4623312 | 104377.007–104837.007 ms | 9129 / 207.007 ms | 882 / 20.000 ms | medium | mfa, whisperx, waveform, spectrogram, manual-review |
| C2-05 | `C2-05-R03` | на | 4624194–4626500 | 104857.007–104909.297 ms | 13539 / 307.007 ms | 882 / 20.000 ms | medium | mfa, whisperx, waveform, spectrogram, manual-review |
| C2-05 | `C2-05-R04` | весь | 4626500–4630368 | 104909.297–104997.007 ms | 8247 / 187.007 ms | 882 / 20.000 ms | medium | mfa, whisperx, waveform, spectrogram, manual-review |
| C2-05 | `C2-05-R05` | мир | 4630368–4757420 | 104997.007–107878.005 ms | 130889 / 2968.005 ms | 882 / 20.000 ms | medium | mfa, whisperx, waveform, spectrogram, manual-review |
| C2-06 | `C2-06-R01` | пусть | 4760948–4777706 | 107958.005–108338.005 ms | MFA unavailable | 882 / 20.000 ms | medium | whisperx, waveform, spectrogram, manual-review |
| C2-06 | `C2-06-R02` | содрогнётся | 4778588–4791818 | 108358.005–108658.005 ms | MFA unavailable | 882 / 20.000 ms | medium | whisperx, waveform, spectrogram, manual-review |
| C2-06 | `C2-06-R03` | земля | 4793582–4875652 | 108698.005–110559.002 ms | MFA unavailable | 882 / 20.000 ms | medium | whisperx, waveform, spectrogram, manual-review |
| C2-07 | `C2-07-R01` | и | 4878298–4884472 | 110619.002–110759.002 ms | MFA unavailable | 882 / 20.000 ms | medium | whisperx, waveform, spectrogram, manual-review |
| C2-07 | `C2-07-R02` | через | 4886236–4901230 | 110799.002–111139.002 ms | MFA unavailable | 882 / 20.000 ms | medium | whisperx, waveform, spectrogram, manual-review |
| C2-07 | `C2-07-R03` | стены | 4903876–4927734 | 111199.002–111740.000 ms | MFA unavailable | 882 / 20.000 ms | medium | whisperx, waveform, spectrogram, manual-review |
| C2-07 | `C2-07-R04` | квартир | 4935672–5017742 | 111920.000–113780.998 ms | MFA unavailable | 882 / 20.000 ms | medium | whisperx, waveform, spectrogram, manual-review |
| C2-08 | `C2-08-R01` | пройдусь | 5019506–5036264 | 113820.998–114200.998 ms | 161803 / 3669.002 ms | 882 / 20.000 ms | medium | mfa, whisperx, waveform, spectrogram, manual-review |
| C2-08 | `C2-08-R02` | волною | 5037146–5045966 | 114220.998–114420.998 ms | 154747 / 3509.002 ms | 882 / 20.000 ms | medium | mfa, whisperx, waveform, spectrogram, manual-review |
| C2-08 | `C2-08-R03` | огня | 5048612–5171254 | 114480.998–117261.995 ms | 152101 / 3449.002 ms | 882 / 20.000 ms | medium | mfa, whisperx, waveform, spectrogram, manual-review |

## Semantic cues

Frame cells show `nearest frame / signed sample-to-frame error` for cue start, then cue end.

| Cue | Russian token IDs | English target | Activation | Samples | Uncertainty | 60 fps start; end | 120 fps start; end |
|---|---|---|---|---:|---:|---:|---:|
| `C1-01-C01` | `C1-01-R01`, `C1-01-R02`, `C1-01-R03` | `C1-01-S01` (And I'll erase) | forward | 1066955–1097825 | 441 / 10.000 ms | 1452 / +6.009 ms; 1494 / +6.009 ms | 2903 / -2.324 ms; 2987 / -2.324 ms |
| `C1-01-C02` | `C1-01-R04` | `C1-01-S02` (the horizon) | forward | 1100471–1124991 | 441 / 10.000 ms | 1497 / -3.991 ms; 1531 / +6.667 ms | 2994 / -3.991 ms; 3061 / -1.667 ms |
| `C1-02-C01` | `C1-02-R01`, `C1-02-R02` | `C1-02-S01` (And shatter) | forward | 1219674–1241724 | 882 / 20.000 ms | 1659 / -7.007 ms; 1689 / -7.007 ms | 3319 / +1.327 ms; 3379 / +1.327 ms |
| `C1-02-C02` | `C1-02-R03` | `C1-02-S02` (it in two) | forward | 1243488–1332702 | 882 / 20.000 ms | 1692 / +2.993 ms; 1813 / -3.333 ms | 3384 / +2.993 ms; 3626 / -3.333 ms |
| `C1-03-C01` | `C1-03-R01` | `C1-03-S01` (I'll fold) | forward | 1346638–1372700 | 882 / 20.000 ms | 1832 / -2.676 ms; 1868 / +6.349 ms | 3664 / -2.676 ms; 3735 / -1.984 ms |
| `C1-03-C02` | `C1-03-R02` | `C1-03-S02` (the peaks) | forward | 1372700–1398764 | 882 / 20.000 ms | 1868 / +6.349 ms; 1903 / -1.338 ms | 3735 / -1.984 ms; 3806 / -1.338 ms |
| `C1-03-C03` | `C1-03-R03`, `C1-03-R04` | `C1-03-S03` (of every mountain) | forward | 1400528–1487052 | 882 / 20.000 ms | 1905 / -8.005 ms; 2023 / -3.333 ms | 3811 / +0.329 ms; 4046 / -3.333 ms |
| `C1-04-C01` | `C1-04-R01` | `C1-04-S01` (And) | forward | 1491462–1494108 | 882 / 20.000 ms | 2029 / -3.333 ms; 2033 / +3.333 ms | 4058 / -3.333 ms; 4066 / +3.333 ms |
| `C1-04-C02` | `C1-04-R02` | `C1-04-S02` (raise) | forward | 1497636–1525904 | 882 / 20.000 ms | 2038 / +6.667 ms; 2076 / -0.998 ms | 4075 / -1.667 ms; 4152 / -0.998 ms |
| `C1-04-C03` | `C1-04-R03` | `C1-04-S03` (the ocean) | forward | 1528550–1628348 | 882 / 20.000 ms | 2080 / +5.669 ms; 2215 / -7.324 ms | 4159 / -2.664 ms; 4431 / +1.009 ms |
| `C1-05-C01` | `C1-05-R01`, `C1-05-R02`, `C1-05-R03` | `C1-05-S01` (I'll scream to) | forward | 1631876–1672492 | 882 / 20.000 ms | 2220 / -3.991 ms; 2275 / -8.322 ms | 4440 / -3.991 ms; 4551 / +0.011 ms |
| `C1-05-C02` | `C1-05-R04`, `C1-05-R05` | `C1-05-S02` (the whole world) | forward | 1674257–1795223 | 882 / 20.000 ms | 2278 / +1.655 ms; 2442 / -8.005 ms | 4556 / +1.655 ms; 4885 / +0.329 ms |
| `C1-06-C01` | `C1-06-R01` | `C1-06-S01` (Let) | forward | 1796987–1814671 | 882 / 20.000 ms | 2445 / +1.995 ms; 2469 / +0.998 ms | 4890 / +1.995 ms; 4938 / +0.998 ms |
| `C1-06-C02` | `C1-06-R02` | `C1-06-S03` (tremble) | forward | 1818199–1931227 | 882 / 20.000 ms | 2474 / +4.331 ms; 2628 / +8.005 ms | 4947 / -4.002 ms; 5255 / -0.329 ms |
| `C1-06-C03` | `C1-06-R03` | `C1-06-S02` (the earth) | backward | 1936519–1971843 | 882 / 20.000 ms | 2635 / +4.671 ms; 2683 / +3.673 ms | 5269 / -3.662 ms; 5366 / +3.673 ms |
| `C1-07-C01` | `C1-07-R01`, `C1-07-R02` | `C1-07-S01` (Through) | forward | 1974489–2012459 | 882 / 20.000 ms | 2686 / -6.327 ms; 2738 / -0.658 ms | 5373 / +2.007 ms; 5476 / -0.658 ms |
| `C1-07-C02` | `C1-07-R03` | `C1-07-S03` (walls) | forward | 2013341–2046020 | 882 / 20.000 ms | 2739 / -3.991 ms; 2784 / +4.989 ms | 5478 / -3.991 ms; 5567 / -3.345 ms |
| `C1-07-C03` | `C1-07-R04` | `C1-07-S02` (apartment) | backward | 2046902–2063660 | 882 / 20.000 ms | 2785 / +1.655 ms; 2808 / +4.989 ms | 5570 / +1.655 ms; 5615 / -3.345 ms |
| `C1-08-C01` | `C1-08-R01` | `C1-08-S01` (I'll sweep through) | forward | 2064542–2078698 | 882 / 20.000 ms | 2809 / +1.655 ms; 2828 / -2.676 ms | 5618 / +1.655 ms; 5656 / -2.676 ms |
| `C1-08-C02` | `C1-08-R02` | `C1-08-S02` (like a wave) | forward | 2080462–2096338 | 882 / 20.000 ms | 2831 / +7.324 ms; 2852 / -2.676 ms | 5661 / -1.009 ms; 5704 / -2.676 ms |
| `C1-08-C03` | `C1-08-R03` | `C1-08-S03` (of fire) | forward | 2098102–2171396 | 882 / 20.000 ms | 2855 / +7.324 ms; 2954 / -4.671 ms | 5709 / -1.009 ms; 5909 / +3.662 ms |
| `V1-01-C01` | `V1-01-R01` | `V1-01-S01` (Night) | forward | 2818784–2834660 | 441 / 10.000 ms | 3835 / -1.338 ms; 3857 / +5.329 ms | 7670 / -1.338 ms; 7713 / -3.005 ms |
| `V1-01-C02` | `V1-01-R02` | `V1-01-S02` (in) | forward | 2835542–2836424 | 441 / 10.000 ms | 3858 / +1.995 ms; 3859 / -1.338 ms | 7716 / +1.995 ms; 7718 / -1.338 ms |
| `V1-01-C03` | `V1-01-R03` | `V1-01-S03` (the silence) | forward | 2837306–2872630 | 441 / 10.000 ms | 3860 / -4.671 ms; 3908 / -5.669 ms | 7721 / +3.662 ms; 7817 / +2.664 ms |
| `V1-01-C04` | `V1-01-R04` | `V1-01-S04` (freezes) | forward | 2873512–2914966 | 441 / 10.000 ms | 3910 / +7.664 ms; 3966 / +0.998 ms | 7819 / -0.669 ms; 7932 / +0.998 ms |
| `V1-01-C05` | `V1-01-R05` | `V1-01-S05` (helplessly;) | forward | 2916730–2958228 | 441 / 10.000 ms | 3968 / -5.669 ms; 4025 / +3.333 ms | 7937 / +2.664 ms; 8050 / +3.333 ms |
| `V1-02-C01` | `V1-02-R01` | `V1-02-S01` (The sky) | forward | 2961756–2983806 | 441 / 10.000 ms | 4030 / +6.667 ms; 4060 / +6.667 ms | 8059 / -1.667 ms; 8119 / -1.667 ms |
| `V1-02-C02` | `V1-02-R02` | `V1-02-S02` (hangs low,) | forward | 2986452–3021776 | 441 / 10.000 ms | 4063 / -3.333 ms; 4111 / -4.331 ms | 8126 / -3.333 ms; 8223 / +4.002 ms |
| `V1-02-C03` | `V1-02-R03` | `V1-02-S03` (a silent) | forward | 3024422–3042062 | 441 / 10.000 ms | 4115 / +2.336 ms; 4139 / +2.336 ms | 8230 / +2.336 ms; 8278 / +2.336 ms |
| `V1-02-C04` | `V1-02-R04` | `V1-02-S04` (ceiling) | forward | 3044708–3103846 | 441 / 10.000 ms | 4142 / -7.664 ms; 4223 / +1.338 ms | 8285 / +0.669 ms; 8446 / +1.338 ms |
| `V1-03-C01` | `V1-03-R01`, `V1-03-R02`, `V1-03-R03`, `V1-03-R04` | `V1-03-S01` (I remember what happened;) | forward | 3104728–3171804 | 441 / 10.000 ms | 4224 / -1.995 ms; 4315 / -6.327 ms | 8448 / -1.995 ms; 8631 / +2.007 ms |
| `V1-03-C02` | `V1-03-R05` | `V1-03-S03` (gnaw at me) | forward | 3173568–3199146 | 441 / 10.000 ms | 4318 / +3.673 ms; 4353 / +7.007 ms | 8636 / +3.673 ms; 8705 / -1.327 ms |
| `V1-03-C03` | `V1-03-R06` | `V1-03-S02` (questions) | backward | 3200910–3236234 | 441 / 10.000 ms | 4355 / +0.340 ms; 4403 / -0.658 ms | 8710 / +0.340 ms; 8806 / -0.658 ms |
| `V1-04-C01` | `V1-04-R01`, `V1-04-R02` | `V1-04-S01` (Who am I?) | forward | 3238880–3278570 | 441 / 10.000 ms | 4407 / +6.009 ms; 4461 / +6.009 ms | 8813 / -2.324 ms; 8921 / -2.324 ms |
| `V1-04-C02` | `V1-04-R03` | `V1-04-S02` (Where am I from?) | forward | 3282980–3305912 | 441 / 10.000 ms | 4467 / +6.009 ms; 4498 / +2.676 ms | 8933 / -2.324 ms; 8996 / +2.676 ms |
| `V1-04-C03` | `V1-04-R04`, `V1-04-R05`, `V1-04-R06`, `V1-04-R07`, `V1-04-R08` | `V1-04-S03` (Where is my home?) | forward | 3306839–3388027 | 441 / 10.000 ms | 4499 / -1.678 ms; 4610 / +7.324 ms | 8998 / -1.678 ms; 9219 / -1.009 ms |
| `V1-05-C01` | `V1-05-R01`, `V1-05-R02` | `V1-05-S01` (My soul) | forward | 3390673–3438301 | 441 / 10.000 ms | 4613 / -2.676 ms; 4678 / +0.658 ms | 9226 / -2.676 ms; 9356 / +0.658 ms |
| `V1-05-C02` | `V1-05-R03` | `V1-05-S02` (walked) | forward | 3441829–3478917 | 441 / 10.000 ms | 4683 / +3.991 ms; 4733 / -3.673 ms | 9366 / +3.991 ms; 9466 / -3.673 ms |
| `V1-05-C03` | `V1-05-R04` | `V1-05-S03` (along) | forward | 3481563–3486855 | 441 / 10.000 ms | 4737 / +2.993 ms; 4744 / -0.340 ms | 9474 / +2.993 ms; 9488 / -0.340 ms |
| `V1-05-C04` | `V1-05-R05` | `V1-05-S04` (the edge) | forward | 3489501–3523017 | 441 / 10.000 ms | 4748 / +6.327 ms; 4793 / -3.673 ms | 9495 / -2.007 ms; 9586 / -3.673 ms |
| `V1-06-C01` | `V1-06-R01` | `V1-06-S01` (My hands) | forward | 3529191–3545993 | 441 / 10.000 ms | 4802 / +6.327 ms; 4824 / -8.005 ms | 9603 / -2.007 ms; 9649 / +0.329 ms |
| `V1-06-C02` | `V1-06-R02` | `V1-06-S02` (shook) | forward | 3548639–3584801 | 441 / 10.000 ms | 4828 / -1.338 ms; 4877 / -4.671 ms | 9656 / -1.338 ms; 9755 / +3.662 ms |
| `V1-06-C03` | `V1-06-R03` | `V1-06-S03` (from) | forward | 3587447–3590975 | 441 / 10.000 ms | 4881 / +1.995 ms; 4886 / +5.329 ms | 9762 / +1.995 ms; 9771 / -3.005 ms |
| `V1-06-C04` | `V1-06-R04` | `V1-06-S04` (the weight) | forward | 3595385–3630709 | 441 / 10.000 ms | 4892 / +5.329 ms; 4940 / +4.331 ms | 9783 / -3.005 ms; 9879 / -4.002 ms |
| `V1-06-C05` | `V1-06-R05` | `V1-06-S05` (of years) | forward | 3633355–3661579 | 441 / 10.000 ms | 4943 / -5.669 ms; 4982 / +4.331 ms | 9887 / +2.664 ms; 9963 / -4.002 ms |
| `V1-07-C01` | `V1-07-R01` | `V1-07-S01` (Some) | forward | 3662461–3680983 | 441 / 10.000 ms | 4983 / +0.998 ms; 5008 / -2.336 ms | 9966 / +0.998 ms; 10016 / -2.336 ms |
| `V1-07-C02` | `V1-07-R02` | `V1-07-S02` (spoke;) | forward | 3683629–3726891 | 441 / 10.000 ms | 5012 / +4.331 ms; 5071 / +6.667 ms | 10023 / -4.002 ms; 10141 / -1.667 ms |
| `V1-07-C03` | `V1-07-R03` | `V1-07-S03` (others) | forward | 3728655–3761333 | 441 / 10.000 ms | 5073 / +0.000 ms; 5117 / -7.664 ms | 10146 / +0.000 ms; 10235 / +0.669 ms |
| `V1-07-C04` | `V1-07-R04` | `V1-07-S04` (stayed silent) | forward | 3763979–3804551 | 441 / 10.000 ms | 5121 / -0.998 ms; 5176 / -4.331 ms | 10242 / -0.998 ms; 10353 / +4.002 ms |
| `V1-08-C01` | `V1-08-R02` | `V1-08-S02` (someone) | forward | 3807197–3817781 | 441 / 10.000 ms | 5180 / +2.336 ms; 5194 / -4.331 ms | 10360 / +2.336 ms; 10389 / +4.002 ms |
| `V1-08-C02` | `V1-08-R03`, `V1-08-R04` | `V1-08-S01` (Behind my back,) | backward | 3819545–3868099 | 441 / 10.000 ms | 5197 / +5.669 ms; 5263 / +4.671 ms | 10393 / -2.664 ms; 10525 / -3.662 ms |
| `V1-08-C03` | `V1-08-R05`, `V1-08-R06` | `V1-08-S03` (couldn't hold back) | forward | 3869863–3910435 | 441 / 10.000 ms | 5265 / -1.995 ms; 5320 / -5.329 ms | 10530 / -1.995 ms; 10641 / +3.005 ms |
| `V1-08-C04` | `V1-08-R07` | `V1-08-S04` (a laugh) | forward | 3912243–3949287 | 441 / 10.000 ms | 5323 / +3.673 ms; 5373 / -2.993 ms | 10646 / +3.673 ms; 10746 / -2.993 ms |
| `C2-01-C01` | `C2-01-R01`, `C2-01-R02`, `C2-01-R03` | `C2-01-S01` (And I'll erase) | forward | 4031225–4061213 | 882 / 20.000 ms | 5485 / +5.669 ms; 5525 / -7.664 ms | 10969 / -2.664 ms; 11051 / +0.669 ms |
| `C2-01-C02` | `C2-01-R04` | `C2-01-S02` (the horizon) | forward | 4062977–4169743 | 882 / 20.000 ms | 5528 / +2.336 ms; 5673 / -1.995 ms | 11056 / +2.336 ms; 11346 / -1.995 ms |
| `C2-02-C01` | `C2-02-R01`, `C2-02-R02` | `C2-02-S01` (And shatter) | forward | 4175917–4204185 | 882 / 20.000 ms | 5682 / +8.005 ms; 5720 / +0.340 ms | 11363 / -0.329 ms; 11440 / +0.340 ms |
| `C2-02-C02` | `C2-02-R03` | `C2-02-S02` (it in two) | forward | 4205949–4307423 | 882 / 20.000 ms | 5722 / -6.327 ms; 5860 / -7.324 ms | 11445 / +2.007 ms; 11721 / +1.009 ms |
| `C2-03-C01` | `C2-03-R01` | `C2-03-S01` (I'll fold) | forward | 4310069–4321535 | 882 / 20.000 ms | 5864 / -0.658 ms; 5880 / +6.009 ms | 11728 / -0.658 ms; 11759 / -2.324 ms |
| `C2-03-C02` | `C2-03-R02` | `C2-03-S02` (the peaks) | forward | 4323299–4333883 | 882 / 20.000 ms | 5882 / -0.658 ms; 5896 / -7.324 ms | 11764 / -0.658 ms; 11793 / +1.009 ms |
| `C2-03-C03` | `C2-03-R03`, `C2-03-R04` | `C2-03-S03` (of every mountain) | forward | 4334765–4449249 | 882 / 20.000 ms | 5898 / +6.009 ms; 6053 / -6.667 ms | 11795 / -2.324 ms; 12107 / +1.667 ms |
| `C2-04-C01` | `C2-04-R01` | `C2-04-S01` (And) | forward | 4449249–4461818 | 882 / 20.000 ms | 6053 / -6.667 ms; 6071 / +8.322 ms | 12107 / +1.667 ms; 12141 / -0.011 ms |
| `C2-04-C02` | `C2-04-R02` | `C2-04-S02` (raise) | forward | 4462700–4486514 | 882 / 20.000 ms | 6072 / +4.989 ms; 6104 / -1.678 ms | 12143 / -3.345 ms; 12208 / -1.678 ms |
| `C2-04-C03` | `C2-04-R03` | `C2-04-S03` (the ocean) | forward | 4491806–4590634 | 882 / 20.000 ms | 6111 / -5.011 ms; 6246 / +3.991 ms | 12223 / +3.322 ms; 12492 / +3.991 ms |
| `C2-05-C01` | `C2-05-R01`, `C2-05-R02`, `C2-05-R03` | `C2-05-S01` (I'll scream to) | forward | 4595926–4626500 | 882 / 20.000 ms | 6253 / +0.658 ms; 6295 / +7.370 ms | 12506 / +0.658 ms; 12589 / -0.964 ms |
| `C2-05-C02` | `C2-05-R04`, `C2-05-R05` | `C2-05-S02` (the whole world) | forward | 4626500–4757420 | 882 / 20.000 ms | 6295 / +7.370 ms; 6473 / +5.329 ms | 12589 / -0.964 ms; 12945 / -3.005 ms |
| `C2-06-C01` | `C2-06-R01` | `C2-06-S01` (Let) | forward | 4760948–4777706 | 882 / 20.000 ms | 6477 / -8.005 ms; 6500 / -4.671 ms | 12955 / +0.329 ms; 13001 / +3.662 ms |
| `C2-06-C02` | `C2-06-R02` | `C2-06-S03` (tremble) | forward | 4778588–4791818 | 882 / 20.000 ms | 6501 / -8.005 ms; 6519 / -8.005 ms | 13003 / +0.329 ms; 13039 / +0.329 ms |
| `C2-06-C03` | `C2-06-R03` | `C2-06-S02` (the earth) | backward | 4793582–4875652 | 882 / 20.000 ms | 6522 / +1.995 ms; 6634 / +7.664 ms | 13044 / +1.995 ms; 13267 / -0.669 ms |
| `C2-07-C01` | `C2-07-R01`, `C2-07-R02` | `C2-07-S01` (Through) | forward | 4878298–4901230 | 882 / 20.000 ms | 6637 / -2.336 ms; 6668 / -5.669 ms | 13274 / -2.336 ms; 13337 / +2.664 ms |
| `C2-07-C02` | `C2-07-R03` | `C2-07-S03` (walls) | forward | 4903876–4927734 | 882 / 20.000 ms | 6672 / +0.998 ms; 6704 / -6.667 ms | 13344 / +0.998 ms; 13409 / +1.667 ms |
| `C2-07-C03` | `C2-07-R04` | `C2-07-S02` (apartment) | backward | 4935672–5017742 | 882 / 20.000 ms | 6715 / -3.333 ms; 6827 / +2.336 ms | 13430 / -3.333 ms; 13654 / +2.336 ms |
| `C2-08-C01` | `C2-08-R01` | `C2-08-S01` (I'll sweep through) | forward | 5019506–5036264 | 882 / 20.000 ms | 6829 / -4.331 ms; 6852 / -0.998 ms | 13659 / +4.002 ms; 13704 / -0.998 ms |
| `C2-08-C02` | `C2-08-R02` | `C2-08-S02` (like a wave) | forward | 5037146–5045966 | 882 / 20.000 ms | 6853 / -4.331 ms; 6865 / -4.331 ms | 13707 / +4.002 ms; 13731 / +4.002 ms |
| `C2-08-C03` | `C2-08-R03` | `C2-08-S03` (of fire) | forward | 5048612–5171254 | 882 / 20.000 ms | 6869 / +2.336 ms; 7036 / +4.671 ms | 13738 / +2.336 ms; 14071 / -3.662 ms |

## Required backward mappings

`V1-03` keeps display order `I remember what happened; | questions | gnaw at me` while the performed ending maps exactly as follows:

```text
V1-03-R05 -> V1-03-S03 (forward)
V1-03-R06 -> V1-03-S02 (backward)
```

`V1-08` keeps display order `Behind my back, | someone | couldn't hold back | a laugh` and maps exactly as follows:

```text
V1-08-R02 -> V1-08-S02 (forward)
V1-08-R03 + V1-08-R04 -> V1-08-S01 (backward)
V1-08-R05 + V1-08-R06 -> V1-08-S03 (forward)
V1-08-R07 -> V1-08-S04 (forward)
```

`V1-08-R01` (А) remains in the complete source-token inventory and is intentionally not assigned a display target because it is a semantically null connective in this English grouping.

## Independent chorus evidence

The repeated choruses were reviewed as separate performances. Each literal below is `token ID: selected onset–offset [manual-review onset, offset]`; the evidence samples are concrete selected-boundary `manual-review` records, not inferred identifiers.

| Pair | First performance (C1) | Second performance (C2) |
|---|---|---|
| 01 | `C1-01-R01: 1066955–1070483 [1066955, 1070483]`; `C1-01-R02: 1073129–1077539 [1073129, 1077539]`; `C1-01-R03: 1081067–1097825 [1081067, 1097825]`; `C1-01-R04: 1100471–1124991 [1100471, 1124991]` | `C2-01-R01: 4031225–4033871 [4031225, 4033871]`; `C2-01-R02: 4035635–4039163 [4035635, 4039163]`; `C2-01-R03: 4040045–4061213 [4040045, 4061213]`; `C2-01-R04: 4062977–4169743 [4062977, 4169743]` |
| 02 | `C1-02-R01: 1219674–1224966 [1219674, 1224966]`; `C1-02-R02: 1225848–1241724 [1225848, 1241724]`; `C1-02-R03: 1243488–1332702 [1243488, 1332702]` | `C2-02-R01: 4175917–4178563 [4175917, 4178563]`; `C2-02-R02: 4181209–4204185 [4181209, 4204185]`; `C2-02-R03: 4205949–4307423 [4205949, 4307423]` |
| 03 | `C1-03-R01: 1346638–1372700 [1346638, 1372700]`; `C1-03-R02: 1372700–1398764 [1372700, 1398764]`; `C1-03-R03: 1400528–1405820 [1400528, 1405820]`; `C1-03-R04: 1407584–1487052 [1407584, 1487052]` | `C2-03-R01: 4310069–4321535 [4310069, 4321535]`; `C2-03-R02: 4323299–4333883 [4323299, 4333883]`; `C2-03-R03: 4334765–4339175 [4334765, 4339175]`; `C2-03-R04: 4340057–4449249 [4340057, 4449249]` |
| 04 | `C1-04-R01: 1491462–1494108 [1491462, 1494108]`; `C1-04-R02: 1497636–1525904 [1497636, 1525904]`; `C1-04-R03: 1528550–1628348 [1528550, 1628348]` | `C2-04-R01: 4449249–4461818 [4449249, 4461818]`; `C2-04-R02: 4462700–4486514 [4462700, 4486514]`; `C2-04-R03: 4491806–4590634 [4491806, 4590634]` |
| 05 | `C1-05-R01: 1631876–1638932 [1631876, 1638932]`; `C1-05-R02: 1639814–1659263 [1639814, 1659263]`; `C1-05-R03: 1660145–1672492 [1660145, 1672492]`; `C1-05-R04: 1674257–1698000 [1674257, 1698000]`; `C1-05-R05: 1698000–1795223 [1698000, 1795223]` | `C2-05-R01: 4595926–4599498 [4595926, 4599498]`; `C2-05-R02: 4603026–4623312 [4603026, 4623312]`; `C2-05-R03: 4624194–4626500 [4624194, 4626500]`; `C2-05-R04: 4626500–4630368 [4626500, 4630368]`; `C2-05-R05: 4630368–4757420 [4630368, 4757420]` |
| 06 | `C1-06-R01: 1796987–1814671 [1796987, 1814671]`; `C1-06-R02: 1818199–1931227 [1818199, 1931227]`; `C1-06-R03: 1936519–1971843 [1936519, 1971843]` | `C2-06-R01: 4760948–4777706 [4760948, 4777706]`; `C2-06-R02: 4778588–4791818 [4778588, 4791818]`; `C2-06-R03: 4793582–4875652 [4793582, 4875652]` |
| 07 | `C1-07-R01: 1974489–1975371 [1974489, 1975371]`; `C1-07-R02: 1978017–2012459 [1978017, 2012459]`; `C1-07-R03: 2013341–2046020 [2013341, 2046020]`; `C1-07-R04: 2046902–2063660 [2046902, 2063660]` | `C2-07-R01: 4878298–4884472 [4878298, 4884472]`; `C2-07-R02: 4886236–4901230 [4886236, 4901230]`; `C2-07-R03: 4903876–4927734 [4903876, 4927734]`; `C2-07-R04: 4935672–5017742 [4935672, 5017742]` |
| 08 | `C1-08-R01: 2064542–2078698 [2064542, 2078698]`; `C1-08-R02: 2080462–2096338 [2080462, 2096338]`; `C1-08-R03: 2098102–2171396 [2098102, 2171396]` | `C2-08-R01: 5019506–5036264 [5019506, 5036264]`; `C2-08-R02: 5037146–5045966 [5037146, 5045966]`; `C2-08-R03: 5048612–5171254 [5048612, 5171254]` |

These fixtures cover 58 chorus tokens and 116 selected-boundary manual-review evidence records. All eight C1/C2 line pairs also have distinct line-relative token timelines; no chorus timing was reused.

## Resolved review and rendering bounds

The mandatory MFA-missing manual-review lines are `C1-06`, `C1-07`, `V1-08`, `C2-06`, and `C2-07` (21 tokens). Every token in these lines has WhisperX acoustic evidence plus original-mix/vocal-stem waveform, spectrogram, and manual-review evidence; substitutions are explicitly labeled rather than treated as text matches. All seven `V1-08` boundaries received this treatment.

The blocking verifier derives onset/offset candidate spread from the two MFA and two WhisperX evidence records for each of 81 MFA-backed tokens. It reports 80 tokens above the 1,102.5-sample (25 ms) threshold and requires selected onset plus offset waveform, spectrogram, and manual-review records for each. It separately enforces the exact 21-token no-MFA set, zero MFA records for those tokens, and 42 selected-boundary records for each of waveform, spectrogram, and manual review. Across all 102 tokens, each selected-boundary method has 204 records.

Open review items: **0**. Unresolved uncertainties above 50 ms: **0**. Unknown source IDs: **0**. Unknown targets: **0**. Proportional timing evidence: **0**. Every one of the 74 English targets is activated exactly once.

Across every semantic cue boundary, maximum nearest-frame error is 8.321995 ms at 60 fps (bound 8.334 ms) and 4.002268 ms at 120 fps (bound 4.167 ms). These are quantization bounds for sample-indexed alignment with frame-bounded rendering, not claims of zero uncertainty or a refresh interval.
