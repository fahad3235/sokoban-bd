// Sokoban BD — UI strings (EN / বাংলা). Persisted language in localStorage.
(function (root) {
  'use strict';
  var STR = {
    en: {
      title: 'Sokoban BD', tagline: 'Push every box onto a target. Think before you push!',
      level: 'Level', moves: 'Moves', pushes: 'Pushes', best: 'Best',
      undo: 'Undo', reset: 'Reset', prev: 'Prev level', next: 'Next level',
      levelsLabel: 'Levels', completed: 'completed',
      win: 'Level complete!', winSub: 'All boxes are on targets.',
      allDone: 'You finished all 12 levels! You are a Sokoban master.',
      nextLevelBtn: 'Next level', playAgain: 'Play again',
      howTitle: 'How to play',
      how1: 'Move with Arrow keys / WASD, or tap the on-screen pad.',
      how2: 'You can only push one box at a time, and never pull.',
      how3: 'A box pushed into a corner (not on a target) is stuck — press Reset.',
      how4: 'Finish with fewer moves to beat your Best score.',
      footer: '100% offline. No account, no uploads — your progress stays in this browser only.',
      solved: 'Solved'
    },
    bn: {
      title: 'সোকোবান বিডি', tagline: 'সব বাক্স লক্ষ্যে ঠেলুন। ঠেলার আগে ভাবুন!',
      level: 'স্তর', moves: 'চাল', pushes: 'ঠেলা', best: 'সেরা',
      undo: 'ফিরিয়ে নিন', reset: 'আবার শুরু', prev: 'আগের স্তর', next: 'পরের স্তর',
      levelsLabel: 'স্তরসমূহ', completed: 'সম্পন্ন',
      win: 'স্তর সম্পন্ন!', winSub: 'সব বাক্স লক্ষ্যে পৌঁছেছে।',
      allDone: 'আপনি ১২টি স্তরই শেষ করেছেন! আপনি একজন সোকোবান মাস্টার।',
      nextLevelBtn: 'পরের স্তর', playAgain: 'আবার খেলুন',
      howTitle: 'কীভাবে খেলবেন',
      how1: 'অ্যারো কী / WASD দিয়ে চলুন, অথবা স্ক্রিনের প্যাড ব্যবহার করুন।',
      how2: 'একবারে একটি বাক্সই ঠেলা যায়, টানা যায় না।',
      how3: 'কোণায় (লক্ষ্য ছাড়া) ঠেলে দিলে বাক্স আটকে যাবে — আবার শুরু চাপুন।',
      how4: 'কম চালে শেষ করে আপনার সেরা স্কোর ভাঙুন।',
      footer: '১০০% অফলাইন। কোনো অ্যাকাউন্ট বা আপলোড নেই — অগ্রগতি শুধু এই ব্রাউজারেই থাকে।',
      solved: 'সমাধান হয়েছে'
    }
  };
  function bnDigits(s) {
    var map = { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' };
    return String(s).replace(/[0-9]/g, function (d) { return map[d]; });
  }
  function fmt(lang, s) { return lang === 'bn' ? bnDigits(s) : String(s); }
  var api = { STR: STR, bnDigits: bnDigits, fmt: fmt };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.SokobanI18n = api;
})(typeof window !== 'undefined' ? window : globalThis);
