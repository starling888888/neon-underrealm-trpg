import { experimental_AstroContainer as AstroContainer } from "astro/container";

type AstroContainerInstance = Awaited<ReturnType<typeof AstroContainer.create>>;

type AstroComponent = Parameters<AstroContainerInstance["renderToString"]>[0];
type RenderOptions = Parameters<AstroContainerInstance["renderToString"]>[1];

export async function renderAstroComponent(
  component: AstroComponent,
  options: RenderOptions,
): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(component, options);
}
