// Builds runtime theme CSS from admin-managed settings with pure white (#FFFFFF)
// and the original LHBD neutral palette as defaults.
export function buildThemeCss(s: Record<string, string>): string {
  const red = s.color_primary || "#E51A24";
  const bg = s.color_bg || "#FFFFFF";
  const surface = s.color_surface || "#FFFFFF";
  const ink = s.color_text || "#1A1A1A";
  const muted = s.color_muted || "#6C757D";
  const border = s.color_border || "rgba(26,26,26,.09)";

  const fontFace = (name: string, url: string) =>
    url
      ? `@font-face{font-family:'${name}';src:url('${url}');font-display:swap;}`
      : "";

  const bodyFamily = s.font_body_family || "";
  const headingFamily = s.font_heading_family || "";
  const accentFamily = s.font_accent_family || "";
  const styleFamily = s.font_style_family || "";
  const banglaFamily = s.font_bangla_family || "Hind Siliguri";
  const englishFamily = s.font_english_family || "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Segoe UI', Manrope, sans-serif";
  const englishDisplayFamily = s.font_english_display_family || "Iowan Old Style, Baskerville, Times New Roman, serif";

  const logoX = Number(s.logo_x || 0);
  const logoY = Number(s.logo_y || 0);
  const boldEnabled = s.font_bold_enabled !== "0";
  const italicEnabled = s.font_italic_enabled !== "0";
  const boldVersionMode = s.font_bold_mode === "1";

  return `
${fontFace("LHBDCustomBody", s.font_body_url || "")}
${fontFace("LHBDCustomHeading", s.font_heading_url || "")}
${fontFace("LHBDCustomAccent", s.font_accent_url || "")}
${fontFace("LHBDCustomStyle", s.font_style_url || "")}
${fontFace("LHBDCustomBangla", s.font_bangla_url || "")}
${fontFace("LHBDCustomEnglish", s.font_english_url || "")}
${fontFace("LHBDCustomEnglishDisplay", s.font_english_display_url || "")}
:root{
  --lhbd-red:${red};
  --lhbd-red-dark:${red};
  --lhbd-bg:${bg};
  --lhbd-paper:${surface};
  --lhbd-ink:${ink};
  --lhbd-muted:${muted};
  --lhbd-border:${border};
  --font-bangla:'${banglaFamily}', 'LHBDCustomBangla', 'Hind Siliguri', 'Noto Sans Bengali', sans-serif;
  --font-english:${englishFamily};
  --font-english-display:${englishDisplayFamily};
}
body{background:${s.color_gradient || bg}!important;color:${ink}!important;}
.card,.glass{background-color:${surface}!important;border-color:${border}!important;}
.text-\\[\\#1A1A1A\\]{color:${ink}!important;}
.text-\\[\\#6C757D\\]{color:${muted}!important;}
.text-\\[\\#E51A24\\]{color:${red}!important;}
.bg-\\[\\#E51A24\\]{background-color:${red}!important;}
.lhbd-brand-image{transform:translate(${logoX}px,${logoY}px);}
${
  bodyFamily
    ? `body,p,span,input,textarea,select,button{font-family:'${bodyFamily}','LHBDCustomBody','Hind Siliguri',sans-serif${s.body_weight ? `;font-weight:${s.body_weight}` : ""}${s.body_line_height ? `;line-height:${s.body_line_height}` : ""}${s.body_letter_spacing ? `;letter-spacing:${s.body_letter_spacing}` : ""};}`
    : ""
}
${
  headingFamily
    ? `h1,h2,h3{font-family:'${headingFamily}','LHBDCustomHeading','Hind Siliguri',sans-serif!important${s.heading_weight ? `;font-weight:${s.heading_weight}` : ""}${s.heading_line_height ? `;line-height:${s.heading_line_height}` : ""}${s.heading_letter_spacing ? `;letter-spacing:${s.heading_letter_spacing}` : ""};}`
    : ""
}
${
  accentFamily
    ? `.btn-red,.text-\\[\\#E51A24\\]{font-family:'${accentFamily}','LHBDCustomAccent',sans-serif${s.accent_weight ? `;font-weight:${s.accent_weight}` : ""}${s.accent_letter_spacing ? `;letter-spacing:${s.accent_letter_spacing}` : ""};}`
    : ""
}
${
  styleFamily
    ? `blockquote,em,.font-style-custom{font-family:'${styleFamily}','LHBDCustomStyle',serif;font-style:italic;}`
    : ""
}
${boldEnabled ? "" : "body,body *{font-weight:400!important;}"}
${boldEnabled && boldVersionMode ? "b,strong,h1,h2,h3,h4,h5,h6,.font-semibold,.font-bold,.font-extrabold{font-weight:800!important;}" : ""}
${italicEnabled ? "" : "i,em,blockquote,.italic,.font-style-custom{font-style:normal!important;}"}
html[lang="bn"] body,html[lang="bn"] input,html[lang="bn"] textarea,html[lang="bn"] select,html[lang="bn"] button{font-family:var(--font-bangla)!important;}
html[lang="en"] body,html[lang="en"] input,html[lang="en"] textarea,html[lang="en"] select,html[lang="en"] button{font-family:var(--font-english),var(--font-bangla),sans-serif!important;}
html[lang="en"] h1,html[lang="en"] h2,html[lang="en"] h3,html[lang="en"] h4,html[lang="en"] h5,html[lang="en"] h6{font-family:var(--font-english-display),var(--font-english),serif!important;font-style:italic;}
`;
}
