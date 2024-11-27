import { externalScriptslist } from "~/utils/external-scripts";

export function ExternalScripts() {
  return (
    <>
      {externalScriptslist.map((script, index) => {
        if (script.enabled === false) return null;
        
        return (
          <script
            key={`external-script-${index}`}
            src={script.src}
            defer={script.defer}
            async={script.async}
            {...script.attributes}
          />
        );
      })}
    </>
  );
}