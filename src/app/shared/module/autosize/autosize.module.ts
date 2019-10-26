
import {NgModule, ModuleWithProviders} from "@angular/core";
import {Autosize} from './autosize.directive';
export * from './autosize.directive';

@NgModule({
    declarations: [
        Autosize
    ],
    exports: [
        Autosize
    ]
})
export class AutosizeModule {
    static forRoot(): ModuleWithProviders {
        return {ngModule: AutosizeModule, providers: []};
    }
}