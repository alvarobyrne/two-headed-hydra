/*import hydraFunctions from 'hydra-synth/src/glsl/glsl-functions.js'
 */

import { type Hydra } from "hydra-ts";
import {
  generatorTransforms,
  modifierTransforms,
} from "hydra-ts/src/glsl/transformDefinitions";
generatorTransforms;
// console.log("generatorTransforms: ", generatorTransforms);
modifierTransforms;
// console.log("modifierTransforms: ", modifierTransforms);
const hydraFunctions = () => [...generatorTransforms, ...modifierTransforms];
const filterOut = ["prev", "sum"];

const getFunctionText = (f = () => {}) => {
  const str = f.toString();
  return str.split("{")[0];
};

export default (hydra: Hydra) => {
  const synthParams = Object.entries(hydra.synth).map(([key, val]) => {
    // console.log(key, val, typeof val);
    let label = key;
    let type = typeof val;
    let info = "";
    if (type === "function") {
      label += "()";
      //  info = getFunctionText(val)
      //   info = val.toString()
    } else if (type === "object") {
      type = val.constructor.name;
    }
    //  if(typeof val === "object") console.log(val.constructor.name)
    return {
      label,
      type,
      name: key,
      //   detail: type,
      info: info,
      //   info: type
      // info: JSON.stringify(val)
    };
  });

  const hydraFuncs = hydraFunctions().filter(
    (h) => !filterOut.includes(h.name)
  );

  const setFunctionOptions = hydraFuncs.map((h) => {
    const g = Object.assign({}, h, { glsl: "<placeholder>" });
    const str = JSON.stringify(g, null, 2);
    const str2 = `\`
     ${h.glsl}
    \``;
    const r = str.replace('"<placeholder>"', str2);
    // console.log('replaced', r)
    return {
      label: `setFunction(<${h.name}>)`,
      apply: r,
    };
  });

  hydraFuncs.forEach((h: any) => {
    if (h.type === "combine" || h.type === "combineCoord") {
      h.inputs = [{ type: "vec4", name: "texture" }, ...h.inputs];
    }
  });

  const functionOptions = hydraFuncs.map((h) => ({
    label: `${h.name}()`,
    type: h.type,
    name: h.name /*detail: h.type,*/,
    apply: `${h.name}()`,
    boost:
      h.type === "src"
        ? 99
        : h.type === "coord"
        ? 90
        : h.type === "color"
        ? 40
        : h.type === "combine"
        ? 20
        : 0,
    info:
      h.inputs !== undefined
        ? `${h.name}( ${h.inputs
            .map(
              (input: any) =>
                `${input.name}${input.default ? ` = ${input.default}` : ""}`
            )
            .join(", ")} )`
        : "",
  }));
  //@ts-ignore
  functionOptions.push({ label: `out()` });

  const srcOptions = functionOptions.filter((h) => h.type === "src");
  const srcNames = srcOptions.map((h) => h.name);
  const chainOptions = functionOptions.filter((h) => h.type != "src");
  //@ts-ignore
  const outputOptions = synthParams.filter((h) => h.type === "Output");
  const externalSourceOptions = synthParams.filter(
    //@ts-ignore
    (h) => h.type === "HydraSource"
  );
  // const textureOptions = [...outputOptions]
  // TODO: what is the sandbox in type script
  // const userConstants = hydra.sandbox.userProps;
  //&& !userConstants.includes(h.label)
  const usefulConstants = ["a", "mouse", "width", "height", "time"];
  const hydraConstants = synthParams.filter((h) =>
    usefulConstants.includes(h.label)
  );
  const combineNames = functionOptions
    .filter((h) => h.type === "combine" || h.type === "combineCoord")
    .map((h) => h.name);
  const hydraGlobals = synthParams.filter(
    //@ts-ignore
    (h) => h.type === "function" && !srcNames.includes(h.name) //||      userConstants.includes(h.label)// TODO: removecomment after figuring out what the sandbox is
  );
  // console.log("functionOptions", functionOptions, srcNames, synthParams);
  return {
    srcOptions,
    chainOptions,
    hydraGlobals,
    setFunctionOptions,
    hydraConstants,
    outputOptions,
    externalSourceOptions,
    combineNames,
  };
};
