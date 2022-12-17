/*!
 * Portions of this file are based on code from ariakit.
 * MIT Licensed, Copyright (c) Diego Haz.
 *
 * Credits to the Ariakit team:
 * https://github.com/ariakit/ariakit/blob/b6c7f8cf609db32e64c8d4b28b5e06ebf437a800/packages/ariakit/src/popover/popover-arrow.tsx
 * https://github.com/ariakit/ariakit/blob/a178c2f2dcc6571ba338fd74c79e3b0eab2a27c5/packages/ariakit/src/popover/__popover-arrow-path.ts
 */

import {
  createPolymorphicComponent,
  getWindow,
  mergeDefaultProps,
  mergeRefs,
} from "@kobalte/utils";
import { Accessor, createEffect, createSignal, JSX, on, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { usePopoverContext } from "./popover-context";
import { BasePlacement } from "./utils";

const DEFAULT_SIZE = 30;
const HALF_DEFAULT_SIZE = DEFAULT_SIZE / 2;

const VIEWBOX = `0 0 ${DEFAULT_SIZE} ${DEFAULT_SIZE}`;

const ROTATE_MAP = {
  top: `rotate(180 ${HALF_DEFAULT_SIZE} ${HALF_DEFAULT_SIZE})`,
  right: `rotate(-90 ${HALF_DEFAULT_SIZE} ${HALF_DEFAULT_SIZE})`,
  bottom: `rotate(0 ${HALF_DEFAULT_SIZE} ${HALF_DEFAULT_SIZE})`,
  left: `rotate(90 ${HALF_DEFAULT_SIZE} ${HALF_DEFAULT_SIZE})`,
};

export const ARROW_PATH =
  "M23,27.8c1.1,1.2,3.4,2.2,5,2.2h2H0h2c1.7,0,3.9-1,5-2.2l6.6-7.2c0.7-0.8,2-0.8,2.7,0L23,27.8L23,27.8z";

export interface PopoverArrowProps {
  /** The HTML styles attribute (object form only). */
  style?: JSX.CSSProperties;

  /** The size of the arrow. */
  size?: number;
}

/**
 * An optional arrow element to render alongside the popover.
 * Must be rendered inside `Popover.Panel`.
 */
export const PopoverArrow = createPolymorphicComponent<"div", PopoverArrowProps>(props => {
  const context = usePopoverContext();

  props = mergeDefaultProps(
    {
      as: "div",
      size: DEFAULT_SIZE,
    },
    props
  );

  const [local, others] = splitProps(props, ["as", "ref", "style", "children", "size"]);

  const dir = () => context.currentPlacement().split("-")[0] as BasePlacement;

  const panelStyle = createComputedStyle(context.panelRef);
  const fill = () => panelStyle()?.getPropertyValue("background-color") || "none";
  const stroke = () => panelStyle()?.getPropertyValue(`border-${dir()}-color`) || "none";
  const borderWidth = () => panelStyle()?.getPropertyValue(`border-${dir()}-width`) || "0px";
  const strokeWidth = () => {
    return parseInt(borderWidth()) * 2 * (DEFAULT_SIZE / local.size!);
  };

  return (
    <Dynamic
      component={local.as}
      ref={mergeRefs(context.setArrowRef, local.ref)}
      aria-hidden="true"
      style={
        {
          // server side rendering
          position: "absolute",
          "font-size": `${local.size!}px`,
          width: "1em",
          height: "1em",
          pointerEvents: "none",
          fill: fill(),
          stroke: stroke(),
          "stroke-width": strokeWidth(),
          ...local.style,
        } as JSX.CSSProperties
      }
      {...others}
    >
      <svg display="block" viewBox={VIEWBOX}>
        <g transform={ROTATE_MAP[dir()]}>
          <path fill="none" d={ARROW_PATH} />
          <path stroke="none" d={ARROW_PATH} />
        </g>
      </svg>
    </Dynamic>
  );
});

function createComputedStyle(element: Accessor<Element | undefined>) {
  const [style, setStyle] = createSignal<CSSStyleDeclaration>();

  createEffect(() => {
    const el = element();
    el && setStyle(getWindow(el).getComputedStyle(el));
  });

  return style;
}
