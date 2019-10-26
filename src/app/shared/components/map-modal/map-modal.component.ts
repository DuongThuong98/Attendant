import { Component , EventEmitter, Output, Input, OnInit, ViewChild} from '@angular/core';
declare var jQuery: any;
import { MapsAPILoader, AgmMap } from '@agm/core';
import { MapService} from '../../shared.module';


@Component({
  selector: 'map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['map-modal.component.css'],

})
export class MapModalComponent implements OnInit {
    @ViewChild('map') map: AgmMap;
    public constructor() { 
    }
    zoom: number = 15;
    ngOnInit(): void {
        this.resizeMap();
    }

    ngOnChanges(): void {
        setTimeout(() => {this.map.triggerResize();},500)
    }

    lat: number = 10.762417;
    lng: number = 106.681201;
    @Input() public title : string;
    public onCloseMap(){
        jQuery("#mapModal").modal("hide");
    }
    public onOpenModal() {
        jQuery("#mapModal").modal({backdrop: 'static', keyboard: false});
        this.resizeMap()      
    }
    markers: marker[] = [
        {
            lat: 10.7896335,
            lng: 106.7022943,
            text: '1'
        },
        {
            lat: 10.7895644,
            lng: 106.7024484,
            text: '3:5'
        },
        {
            lat: 10.7896215,
            lng: 106.7024325,
            text: '9'
        },
        {
            lat: 10.7893873,
            lng: 106.7025177,
            text: '10,4'
        }
    ]
    resizeMap(): any {
        this.map.triggerResize();
    }
}
// just an interface for type safety.
interface marker {
	lat: number;
	lng: number;
	text: string;
}
