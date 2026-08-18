import { PostRequest } from "~/utils/new-request";

export async function updateRecordingLayout(
  buzzId: string | undefined,
  screenShareUintUid?: number,
  cameraUintUid?: number,
  includeCameraPiP = false
) {
  if (!buzzId || !screenShareUintUid) return;

  const layoutConfig = [
    {
      uid: String(screenShareUintUid),
      x_axis: 0,
      y_axis: 0,
      width: 1.0,
      height: 1.0,
      alpha: 1.0,
      render_mode: 1,
    },
  ];

  if (includeCameraPiP && cameraUintUid) {
    layoutConfig.push({
      uid: String(cameraUintUid),
      x_axis: 0.8,
      y_axis: 0.8,
      width: 0.2,
      height: 0.2,
      alpha: 1.0,
      render_mode: 0,
    });
  }

  await PostRequest(`/buzz/${buzzId}/recording/update-layout`, {
    layoutConfig,
  });
}
