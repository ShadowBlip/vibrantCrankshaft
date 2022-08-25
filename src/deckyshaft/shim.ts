const v4cache = {};

if (!window.webpackJsonp || window.webpackJsonp.deckyshimmed) {
  window.webpackJsonp = {
    deckyshimmed: true,
    push: (mod: any): any => {
      if (mod[1].get_require) return { c: v4cache };
    },
  };
}

export default {};
