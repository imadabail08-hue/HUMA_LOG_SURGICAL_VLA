import { InstrumentClassDefinition } from '../types/instrument';

export interface EnhancedInstrumentClassDefinition extends InstrumentClassDefinition {
  thickness_mm: number;
  weight_g: number;
  material: string;
  finish: string;
  mechanical_features: string[];
}

export const SURGICAL_INSTRUMENT_CLASSES: Record<number, EnhancedInstrumentClassDefinition> = {
  0: {
    id: 0,
    name: 'surgical_scissors',
    french_name: 'Ciseaux chirurgicaux droits',
    color: '#FF0000',
    description: 'Ciseaux métalliques droits à double anneau ergonomique, vis d\'articulation centrale et lames effilées pour dissection.',
    category: 'cutting',
    length_mm: 145,
    width_mm: 50,
    thickness_mm: 4.5,
    weight_g: 48,
    material: 'Acier inoxydable chirurgical AISI 420',
    finish: 'Poli satiné antireflet',
    mechanical_features: [
      'Deux anneaux digitaux symétriques',
      'Vis de pivotement traversante affleurante',
      'Lames droites à tranchant rodé'
    ],
    clinical_purpose: 'Incision et résection minutieuse des tissus mous et des fils chirurgicaux.'
  },
  1: {
    id: 1,
    name: 'cutting_nipper',
    french_name: 'Pince coupante / rongeur articulée',
    color: '#00FF00',
    description: 'Pince coupante articulée avec ressort de rappel à lame double et mors courts biseautés pour section de cartilage.',
    category: 'cutting',
    length_mm: 125,
    width_mm: 45,
    thickness_mm: 9.0,
    weight_g: 72,
    material: 'Acier trempé inoxydable 440A',
    finish: 'Microbillé mat satiné',
    mechanical_features: [
      'Poignées ergonomiques incurvées',
      'Ressort de rappel interne à double lame',
      'Mors tranchants massifs à angle d\'attaque court'
    ],
    clinical_purpose: 'Section précise de matériaux rigides, petits os et cartilages délicats.'
  },
  2: {
    id: 2,
    name: 'dissecting_scalpel',
    french_name: 'Bistouri fixe de dissection',
    color: '#0000FF',
    description: 'Bistouri monobloc en acier inox avec lame fixe convexe biseautée et manche plat ergonomique.',
    category: 'cutting',
    length_mm: 150,
    width_mm: 14,
    thickness_mm: 2.5,
    weight_g: 34,
    material: 'Acier martensitique inoxydable 316L',
    finish: 'Poli miroir sur lame, brossé sur manche',
    mechanical_features: [
      'Lame fixe courbe intégrée monobloc',
      'Épaulement conique de transition',
      'Manche ergonomique rigide plat'
    ],
    clinical_purpose: 'Incisions anatomiques franches et décollement de plans tissulaires.'
  },
  3: {
    id: 3,
    name: 'dissecting_needle',
    french_name: 'Aiguille droite de dissection',
    color: '#FFFF00',
    description: 'Stylet de dissection avec manche prismatique hexagonal et tige cylindrique terminée en pointe droite affûtée.',
    category: 'probing',
    length_mm: 140,
    width_mm: 6,
    thickness_mm: 6.0,
    weight_g: 18,
    material: 'Inox chirurgical 304 / pointe trempée',
    finish: 'Brossé longitudinal',
    mechanical_features: [
      'Manche hexagonal empêchant le roulement',
      'Tige effilée à haute rectitude',
      'Pointe conique atraumatique sur tige'
    ],
    clinical_purpose: 'Dégagement minutieux des fascias, micro-vaisseaux et filets nerveux.'
  },
  4: {
    id: 4,
    name: 'grooved_director',
    french_name: 'Sonde cannelée à double ailette papillon',
    color: '#FF00FF',
    description: 'Sonde chirurgicale métallique présentant une tige médiane cannelée et deux extrémités évasées en palette papillon échancrée.',
    category: 'probing',
    length_mm: 145,
    width_mm: 24,
    thickness_mm: 3.0,
    weight_g: 22,
    material: 'Acier inoxydable austénitique 304',
    finish: 'Finition polie électrolytique',
    mechanical_features: [
      'Double palette papillon échancrée aux extrémités',
      'Rainure centrale formant guide de bistouri',
      'Gorge de glissement pour scalpel'
    ],
    clinical_purpose: 'Protection des structures sous-jacentes et guidage de scalpel pour section sous-fasciale.'
  },
  5: {
    id: 5,
    name: 'dissecting_forceps',
    french_name: 'Pince à disséquer dentelée',
    color: '#00FFFF',
    description: 'Pince de préhension élastique avec branches striées transversalement et mors étroits striés pour saisie délicate.',
    category: 'grasping',
    length_mm: 145,
    width_mm: 10,
    thickness_mm: 3.5,
    weight_g: 26,
    material: 'Acier ressort inoxydable AISI 301/304',
    finish: 'Satiné avec rainures de préhension',
    mechanical_features: [
      'Talon arrière soudé élastique',
      'Grip antidérapant bilatéral strié au pouce',
      'Pointes effilées à cannelures transversales'
    ],
    clinical_purpose: 'Préhension atraumatique des tissus délicats et manipulation sans écrasement.'
  },
  6: {
    id: 6,
    name: 'blunt_probe',
    french_name: 'Stylet à pointe mousse',
    color: '#FFA500',
    description: 'Tige cylindrique inox droite calibrée avec embouts sphériques renflés mousses pour exploration atraumatique.',
    category: 'probing',
    length_mm: 145,
    width_mm: 4,
    thickness_mm: 3.0,
    weight_g: 14,
    material: 'Acier inox 304 étiré',
    finish: 'Poli satiné brillant',
    mechanical_features: [
      'Tige rigide parfaitement rectiligne',
      'Extrémités sphériques polies sans bavure',
      'Corps équilibré'
    ],
    clinical_purpose: 'Exploration des trajets fistuleux, cavités et décollements de fascias sans risque perforatif.'
  },
  7: {
    id: 7,
    name: 'scalpel_handle',
    french_name: 'Manche de bistouri n°3/4',
    color: '#800080',
    description: 'Manche plat ergonomique avec zones d\'appui striées pour le pouce et embout de fixation à baïonnette pour lame chirurgicale.',
    category: 'handling',
    length_mm: 135,
    width_mm: 14,
    thickness_mm: 3.0,
    weight_g: 28,
    material: 'Acier inoxydable chirurgical 316L',
    finish: 'Brossé satiné avec crans de grip usinés',
    mechanical_features: [
      'Embout mâle à baïonnette calibré n°3/4',
      'Crans transversaux de préhension ergonomique',
      'Extrémité spatulée plate'
    ],
    clinical_purpose: 'Support ergonomique et standardisé pour lames chirurgicales stériles interchangeables.'
  }
};

export const INSTRUMENT_CLASSES_LIST: EnhancedInstrumentClassDefinition[] = Object.values(SURGICAL_INSTRUMENT_CLASSES);

export const getInstrumentClassById = (id: number): EnhancedInstrumentClassDefinition => {
  return SURGICAL_INSTRUMENT_CLASSES[id] ?? {
    id,
    name: `unknown_class_${id}`,
    french_name: `Instrument inconnu #${id}`,
    color: '#94A3B8',
    description: 'Classe non référencée.',
    category: 'handling',
    length_mm: 120,
    width_mm: 10,
    thickness_mm: 3.0,
    weight_g: 20,
    material: 'Inox',
    finish: 'Standard',
    mechanical_features: [],
    clinical_purpose: 'Non spécifié.'
  };
};
