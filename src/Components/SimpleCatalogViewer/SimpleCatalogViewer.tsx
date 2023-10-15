import React, { useEffect, useState } from "react";
import { AxiosResponse } from "axios";
import {
  Cesium3DTileset,
  CesiumMap,
  CesiumSceneMode,
} from "@map-colonies/react-components";
import { requestHandlerWithToken } from "./utils/requestHandler";
import {
  getRecordsQueryByID,
  parseQueryResults,
} from "./utils/cswQueryBuilder";
import appConfig from "../../Utils/Config";
import Terrain from "../Terrain/Terrain";
import { useQueryParams } from "../../Hooks/useQueryParams";

import "./SimpleCatalogViewer.css";
import { validateIDsQuery, validatePositionQuery } from "./utils/validateQueryParams";

const MAXIMUM_SCREEN_SPACE_ERROR = 5;
const CULL_REQUESTS_WHILE_MOVING_MULTIPLIER = 120;
interface IClientFlyToPosition {
  center: [number, number],
  zoom: number
};

const SimpleCatalogViewer: React.FC = (): JSX.Element => {
  const [models, setModels] = useState<Record<string, unknown>[]>([]);
  const queryParams = useQueryParams();

  let clientPosition: IClientFlyToPosition | undefined = undefined;
  let modelIds: string[] = [];
  let idQueried: string | null = queryParams.get("model_ids");
  if (idQueried == null) {
    console.error({ msg: `didn't provide models_ids` });
    alert(`Error: model_ids does not exists in the query params!\nA good example: "http://url?model_ids=ID1,ID2"`);
  } else {
    if (!validateIDsQuery(idQueried)) {
      console.error({ msg: `models_ids param is not according to the specifications` });
      alert(`Error: model_ids does not fit the specification!\nA good example: "http://url?model_ids=ID1,ID2"`);
    } else {
      modelIds = idQueried.split(',');
      if (modelIds.length > 2) {
          alert(`Warning: You provided more than 2 models. This is not recommended`);
      }
    }
  }

  const positionQueried: string | null = queryParams.get("position");
  if (positionQueried != null) {
    if (!validatePositionQuery(positionQueried)) {
      console.error({ msg: `position param is not according to the specifications` });
      alert(`Error: position does not fit the specification!\nA good example: "http://url?position=lon,lat,height"\nP.S\nThe position param is optional`);
    } else {
      const parsedPosition = positionQueried.split(',');
      clientPosition = {
        center: [+parsedPosition[0], +parsedPosition[1]],
        zoom: +parsedPosition[2]
      }
    }
  }
  const userToken = queryParams.get("token");
  if (userToken === null) {
    console.error({ msg: `didn't provide token` });
    alert(`Error: No token was provided. The token should be as a query param with the name "token".\nA good example: "http://url?token=TOKEN"`);
  }

  useEffect(() => {
    const cswRequestHandler = async (
      url: string,
      method: string,
      params: Record<string, unknown>
    ): Promise<AxiosResponse> =>
      requestHandlerWithToken(
        appConfig.simpleCatalogViewerTool.csw3dUrl,
        method,
        params
      );

    cswRequestHandler(appConfig.simpleCatalogViewerTool.csw3dUrl, "POST", {
      data: getRecordsQueryByID(modelIds, "http://schema.mapcolonies.com/3d"),
    }).then((res) => {
      let modelsResponse = parseQueryResults(res.data, "mc:MC3DRecord");
      if (modelsResponse !== null) {
        setModels(modelsResponse);
      }
    }).catch(e => console.error(e));
  }, []);

  return (
    <CesiumMap
      center={clientPosition?.center ?? appConfig.mapCenter}
      zoom={clientPosition?.zoom ?? appConfig.mapZoom}
      sceneModes={[CesiumSceneMode.SCENE3D]}
      baseMaps={appConfig.baseMaps}
    >
        {
        models.length && models.map((model) => {
            let links = (model["mc:links"] as any);
            if(Array.isArray(links)) {
                links = links.find((link) => link["@_scheme"] === "3D_LAYER");
            }
            return (
                <Cesium3DTileset
                  maximumScreenSpaceError={MAXIMUM_SCREEN_SPACE_ERROR}
                  cullRequestsWhileMovingMultiplier={
                    CULL_REQUESTS_WHILE_MOVING_MULTIPLIER
                  }
                  preloadFlightDestinations
                  preferLeaves
                  skipLevelOfDetail
                  url={`${links["#text"]}?token=${userToken}`}
                  isZoomTo={!clientPosition && model["mc:id"] === modelIds[0]}
                />
            )
        })
    }
      <Terrain />
    </CesiumMap>
  );
};

export default SimpleCatalogViewer;
