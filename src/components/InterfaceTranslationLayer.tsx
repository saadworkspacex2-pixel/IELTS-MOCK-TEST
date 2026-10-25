"use client";

import { useEffect } from "react";
import { translateBnText } from "@/lib/interfaceTranslations";
import { useLocale } from "./LocaleProvider";

const ATTRIBUTE_NAMES = ["placeholder", "title", "aria-label", "alt"];

function localizeTree(root: Node, locale: "bn" | "en") {
  if (locale !== "en") return;
  const headingRoot = root instanceof Document ? root : root instanceof Element ? root : root.parentElement;
  headingRoot?.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((heading) => {
    if (heading.closest("[data-no-translate]") || (heading as HTMLElement).dataset.localizedEn === "true") return;
    const original = heading.textContent ?? "";
    const translated = translateBnText(original, locale);
    if (translated !== original) {
      // SpringHeading splits Bangla into animated word spans. Replacing only
      // recognised headings preserves a natural English phrase instead of a
      // word-for-word sentence while retaining the heading element itself.
      heading.replaceChildren(document.createTextNode(translated));
      (heading as HTMLElement).dataset.localizedEn = "true";
    }
  });

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let node = walker.nextNode();
  while (node) {
    const parent = node.parentElement;
    if (parent && !parent.closest("script, style, textarea, [data-no-translate]")) textNodes.push(node as Text);
    node = walker.nextNode();
  }
  textNodes.forEach((textNode) => {
    const translated = translateBnText(textNode.nodeValue ?? "", locale);
    if (translated !== textNode.nodeValue) textNode.nodeValue = translated;
  });

  if (!(root instanceof Element || root instanceof Document)) return;
  const elements = root instanceof Document ? root.querySelectorAll("*") : [root, ...root.querySelectorAll("*")];
  elements.forEach((element) => {
    if (element.closest("[data-no-translate]")) return;
    ATTRIBUTE_NAMES.forEach((name) => {
      const value = element.getAttribute(name);
      if (!value) return;
      const translated = translateBnText(value, locale);
      if (translated !== value) element.setAttribute(name, translated);
    });
  });
}

/**
 * Allows the existing Bangla-first, server-rendered UI to switch language
 * without changing authored exam content or learner answers.
 */
export default function InterfaceTranslationLayer() {
  const { locale } = useLocale();

  useEffect(() => {
    document.documentElement.lang = locale;
    localizeTree(document, locale);
    if (locale !== "en") return;

    const observer = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => localizeTree(node, locale));
        if (record.type === "characterData") localizeTree(record.target, locale);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [locale]);

  return null;
}
