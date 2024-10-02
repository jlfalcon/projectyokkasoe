import { ref } from 'vue';

export function useDropdown(loadData) {
    const loading = ref(false);
    const dropDownConfig = ref({
        data: [
            { id: 1, label: 'Overall', selected: true },
            { id: 2, label: 'Online', selected: false },
            { id: 3, label: 'Physical', selected: false },
            { id: 4, label: 'PY', selected: false },
            { id: 5, label: 'Hunting', selected: false },
        ]
    });

    const filters = ref( [dropDownConfig.value.data[0].label] );
    
    function onDropdownSelectChanged() {
        //console.log('dropdown selected', );
        filters.value = dropDownConfig.value.data
            .filter(item => item.selected)
            .map(item => item.label);
        if( loadData ){
            loadData();
        }
    }

    function getSurveyDropdownTitle(){
        if( filters.value.length > 0 ){
            return filters.value.join(",");
        }else{
            return "Select Survey";
        }
    }

    function getFullTitle( props ){
        let result = props.title;
        if( filters.value.length > 0 ){
            result += " - " + filters.value.join(",");
        }
        //console.log( 'getFullTitle: ', result );
        return result;
    }

    function filterTitle(  ){
        let result = "OVERALL";
        if( filters.value.length > 0 ){
            result = filters.value.join(",");
        }
        //console.log( 'getFullTitle: ', result );
        return result;
    }

    function buildUrl( url ){
        let result = url;
        if( filters.value.length == 1 && filters.value[0] == "Overall" ){
            return url;
        }else if( filters.value.length > 0 ){
            result += "?kind=" + filters.value.join(",");
        }
        //console.log( 'getFullTitle: ', result );
        return result;
    }
    

    return {
        loading,
        filters,
        dropDownConfig,
        onDropdownSelectChanged,
        getSurveyDropdownTitle,
        getFullTitle, 
        filterTitle, 
        buildUrl
    };
}
