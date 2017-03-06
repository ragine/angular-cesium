import { Component, OnInit } from '@angular/core';
import { WebSocketSupplier } from '../utils/services/webSocketSupplier/webSocketSupplier';
import { MapLayerProviderOptions } from '../../src/angular-cesium/models/map-layer-provider-options.enum';

@Component({
	selector: 'app-root',
	templateUrl: 'app.component.html',
	styleUrls: ['app.component.css'],
	providers: [WebSocketSupplier]
})

export class AppComponent implements OnInit {
	arcGisMapServerProvider = MapLayerProviderOptions.ArcGisMapServer;

	constructor() {
	}

	ngOnInit() {
	}
}
