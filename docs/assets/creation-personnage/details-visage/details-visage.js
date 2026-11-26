/* LAST REFUGE · XM — Détails du visage (16 modèles) : taches, cicatrices, piercings, masques…
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import { metal } from '../materiaux/materiaux.js';
import { box, ell, mat, tube } from '../outils/outils-3d.js';
import { dDot, dPoly, dStroke, dctx } from '../tete/decalques.js';
import { R, shell } from '../tete/tete.js';

function extras(C) {
  const k = C.s.extra;
  if (!k) return;
  const { head, H } = C,
    ctx = dctx(C);
  switch (k) {
    case 1:
      for (const [x, y] of [
        [-0.04, -0.01],
        [-0.055, -0.025],
        [-0.03, -0.03],
        [-0.065, -0.01],
        [0.04, -0.01],
        [0.055, -0.025],
        [0.03, -0.03],
        [0.065, -0.01],
        [0, -0.012],
        [-0.02, -0.015],
        [0.02, -0.015]
      ])
        dDot(C, ctx, x, y, 0.0035, 'rgba(150,80,40,.7)');
      break;
    case 2:
      dStroke(
        C,
        ctx,
        [
          [0.06, 0.07],
          [0.075, 0.03],
          [0.09, -0.02]
        ],
        'rgba(130,40,40,.9)',
        0.006
      );
      for (let i = 0; i < 3; i++)
        dStroke(
          C,
          ctx,
          [
            [0.06 + i * 0.012, 0.045 - i * 0.02],
            [0.085 + i * 0.012, 0.04 - i * 0.02]
          ],
          'rgba(150,60,60,.85)',
          0.003
        );
      break;
    case 3:
      dPoly(
        C,
        ctx,
        [
          [0.07, -0.01],
          [0.115, -0.01],
          [0.115, -0.04],
          [0.07, -0.04]
        ],
        'rgba(240,200,170,.95)',
        'rgba(130,90,70,.9)'
      );
      dStroke(
        C,
        ctx,
        [
          [0.075, -0.025],
          [0.11, -0.025]
        ],
        'rgba(150,100,80,.8)',
        0.002
      );
      break;
    case 4:
      for (const s of [-1, 1]) {
        const x = s * R * H.sx * 0.96;
        ell(0.006, 0.006, 0.006, metal('#d8b030', 0.2), x, -0.045, -0.005, head);
      }
      break;
    case 5:
      ell(0.0045, 0.0045, 0.0045, metal('#d8d8d8', 0.2), 0.03, -0.027, H.surf(0.03, -0.027) + 0.012, head);
      break;
    case 6:
      for (let i = 0; i < 5; i++)
        dStroke(
          C,
          ctx,
          [
            [-0.11, 0.0 + i * 0.012],
            [-0.085, 0.02 + i * 0.01],
            [-0.06, 0.0 + i * 0.012]
          ],
          'rgba(30,60,110,.75)',
          0.003
        );
      break;
    case 7:
      dStroke(
        C,
        ctx,
        [
          [-0.09, 0.015],
          [-0.04, 0.025],
          [0.04, 0.025],
          [0.09, 0.015]
        ],
        'rgba(200,40,30,.85)',
        0.014
      );
      dStroke(
        C,
        ctx,
        [
          [-0.09, -0.02],
          [0.09, -0.02]
        ],
        'rgba(240,240,230,.85)',
        0.01
      );
      break;
    case 8:
      head.add(
        shell(H, (x, y, z) => y < -0.12 && y > -0.7 && z > 0.1, 0.008, mat('#d8e6ee', { roughness: 0.8 }))
      );
      break;
    case 9:
      {
        const sc = mat('#a02828', { roughness: 0.9 });
        tube(
          [
            [-0.14, -0.2, 0.05],
            [-0.1, -0.23, 0.12],
            [0, -0.25, 0.14],
            [0.1, -0.23, 0.12],
            [0.14, -0.2, 0.05]
          ],
          0.025,
          sc,
          head,
          18,
          8
        );
        ell(0.03, 0.06, 0.025, sc, 0.07, -0.3, 0.1, head);
      }
      break;
    case 10:
      for (const s of [-0.04, 0.04])
        ell(0.0035, 0.0035, 0.0035, metal('#d8d8d8', 0.3), s, -0.2, 0.14, C.body);
      {
        const chn = [
          [-0.07, 0, 0],
          [-0.06, -0.03, 0.03],
          [0, -0.06, 0.05],
          [0.06, -0.03, 0.03],
          [0.07, 0, 0]
        ];
        tube(
          chn.map((p) => [p[0], 1.38 + p[1], 0.1 + p[2]]),
          0.003,
          metal('#d8d8d8', 0.3),
          C.body,
          12,
          5
        );
        box(0.04, 0.06, 0.004, metal('#d8d8d8', 0.3), 0, 1.3, 0.115, C.body);
      }
      break;
    case 11:
      dDot(C, ctx, -0.05, -0.005, 0.02, 'rgba(60,40,80,.35)', 0.5);
      dDot(C, ctx, 0.05, -0.005, 0.02, 'rgba(60,40,80,.35)', 0.5);
      break;
    case 12:
      dStroke(
        C,
        ctx,
        [
          [-0.05, -0.015],
          [-0.052, -0.035]
        ],
        'rgba(30,70,140,.85)',
        0.004
      );
      dDot(C, ctx, -0.052, -0.04, 0.005, 'rgba(30,70,140,.85)');
      break;
    case 13:
      dStroke(
        C,
        ctx,
        [
          [-0.12, 0.1],
          [-0.09, 0.12],
          [-0.05, 0.1]
        ],
        'rgba(240,240,230,.9)',
        0.016
      );
      dStroke(
        C,
        ctx,
        [
          [-0.1, 0.03],
          [-0.12, 0.0]
        ],
        'rgba(240,240,230,.9)',
        0.014
      );
      break;
    case 14:
      for (let i = 0; i < 3; i++)
        dStroke(
          C,
          ctx,
          [
            [0.03 + i * 0.014, 0.01],
            [0.05 + i * 0.014, -0.05]
          ],
          'rgba(160,30,30,.85)',
          0.0035
        );
      break;
    case 15:
      ell(0.005, 0.005, 0.005, metal('#d8d8d8', 0.3), 0.07, 0.085, H.surf(0.07, 0.085) + 0.004, head);
      ell(0.005, 0.005, 0.005, metal('#d8d8d8', 0.3), 0.07, 0.07, H.surf(0.07, 0.07) + 0.004, head);
      break;
    case 16:
      {
        const sc = mat('#7a4a8a', { roughness: 0.9 });
        tube(
          [
            [-0.13, -0.18, 0.05],
            [-0.1, -0.22, 0.12],
            [0, -0.23, 0.14],
            [0.1, -0.22, 0.12],
            [0.13, -0.18, 0.05]
          ],
          0.03,
          sc,
          head,
          18,
          8
        );
      }
      break;
  }
}

export { extras };
