import * as React from 'react';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

class ExerciseTable extends React.Component<any, any> {

    shouldExpand(row) {
        return row.items.length > 1;
    }

    expandComponent(row) {
        return <ExerciseTableExpansion data={[row.details]}/>;
    }

    render() {
        let options = {defaultSortName: 'date', defaultSortOrder: 'desc', expandRowBgColor: "rgba(100, 149, 237, 0.2)"};
        return (
            <BootstrapTable hover condensed bordered={false} data={this.props.data} options={options}
                            expandableRow={this.shouldExpand} expandComponent={this.expandComponent} pagination>
            </BootstrapTable>
        );
    }
}

const ExerciseTableExpansion = props => {
    return <div></div>
};