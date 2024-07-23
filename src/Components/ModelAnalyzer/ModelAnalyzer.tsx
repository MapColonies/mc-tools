import { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import { Box } from '@map-colonies/react-components';
import { useQueryParams } from '../../Hooks/useQueryParams';
import appConfig, { LinkType } from '../../Utils/Config';
import { validateIDsQuery } from '../../Utils/ValidateQueryParams';
import { requestHandlerWithToken } from '../../Utils/RequestHandler';
import { getRecordsQueryByID, parseQueryResults } from '../../Utils/CswQueryBuilder';

import './ModelAnalyzer.css';

const ModelAnalyzer: React.FC = (): JSX.Element => {
	const [models, setModels] = useState<Record<string, unknown>[]>([]);
	const queryParams = useQueryParams();

	// let clientPosition: IClientFlyToPosition | undefined = undefined;
	let modelIds: string[] = [];
	let idQueried = queryParams.get("model_ids");
	const userToken = queryParams.get("token");
	const isDebugMode = queryParams.get("debug");

	if (idQueried == null) {
		console.error({ msg: `didn't provide models_ids` });
	} else {
		if (!validateIDsQuery(idQueried)) {
			console.error({ msg: `models_ids param is not according to the specifications` });
		} else {
			modelIds = idQueried.split(',');

			// Make a unique model ids array
			modelIds = [...new Set(modelIds)];
		}
	}

	useEffect(() => {
		if (userToken === null) {
			console.error({ msg: `No token was provided` });
		}

		if (modelIds.length > 2) {
			console.warn({ msg: 'You provided more than 2 models. This is not recommended' });
		}

		if (userToken) {
			const cswRequestHandler = async (
				url: string,
				method: string,
				params: Record<string, unknown>
			): Promise<AxiosResponse> => requestHandlerWithToken(url, method, params, userToken);

			cswRequestHandler(appConfig.csw3dUrl, 'POST', {
				data: getRecordsQueryByID(modelIds, 'http://schema.mapcolonies.com/3d')
			})
				.then((res) => {
					let modelsResponse = parseQueryResults(res.data, 'mc:MC3DRecord');
					if (modelsResponse !== null) {
						setModels(modelsResponse);
					}
				})
				.catch((e) => {
					console.error({ e });
				});
		}
	}, []);

	let links = models[0]?.["mc:links"] as any;
	if (Array.isArray(links)) {
			links = links.find((link) => link["@_scheme"] === LinkType.THREE_D_LAYER || link["@_scheme"] === LinkType.THREE_D_TILES);
	}
	const url = links ? `${links?.["#text"]}?token=${userToken}` : null;

	const modelUrlParam = `?modelUrl=${url || ''}`;
	const debugModeParam = `&debug=${isDebugMode || false}`;
	const appVersion = `&version=${appConfig.imageTag}`;

	const iframeParams = `${modelUrlParam}${debugModeParam}`;

	return (
		<>
			<Box>
				<iframe
					id="viewer-iframe"
					src={`./Cesium-ion-SDK-1.110/Apps/3d-analysis.htm${iframeParams}${appVersion}`}
					title="Simple Viewer"
				/>
			</Box>
		</>
	);
};

export default ModelAnalyzer;