import React from 'react';
import _ from 'lodash'


export class Sidebar extends React.Component {

    render() {

        return <div id="sidebar" className="sidebar">
            <button className="close-button fa fa-fw fa-close"></button>

        </div>;


    }
}

export class Details extends React.Component {

    render() {
        const {study = {}} = this.props;
        return <div>
                    <div id="study-title"> { study.title }</div>
                    <div id="study-description">
                        <a href={ `http://dx.doi.org/${study.dir}` } target="_new" rel="noopener noreferrer"><i className="fa fa-link"></i> Read the <b>data descriptor article</b></a>
                    </div>

                </div>;
    }

}

export default function() {}



/*


 <div id="study-title">{{study_title}}</div>
 <div id="study-description">
 <a href="http://dx.doi.org/{{study_id}}" target="_new"><i class="fa fa-link"></i> Read the <b>data descriptor article</b></a>
 </div>

 <div class="cf"></div>
 <br/>

 <div id="study">
 <div class="section-header">Study Details</div>

 <div class="clearfix"></div>

 <div id="study-details">
 </div>

 </div>


 <div id="samples">
 <div class="section-header">Sample Details <span class="btn btn-default" onclick="ISATabViewer.rendering.render_assay('{{study_id}}','{{study_file}}')">View samples.</span> </div>

 <div class="clearfix"></div>

 <div id="sample-distribution">

 </div>

 </div>

 <div id="factors">

 <span class="section-header">Factors</span>
 <ul>
 {{#each factors}}
 <li>
 <p class="protocol-name">{{[Study Factor Name]}} </p>
 </li>
 {{/each}}
 </ul>
 </div>


 <div id="protocols">
 <span class="section-header">Methods Details</span>
 <ul>
 {{#each protocols}}
 <li>
 <p class="protocol-name">{{[Study Protocol Name]}} <span
 class="type-tag">{{[Study Protocol Type]}}</span></p>
 </li>
 {{/each}}
 </ul>
 </div>

 <div class="clearfix"></div>

 <div id="publications">

 <span class="section-header">Related Publications using this Dataset</span>
 <ul>
 {{#each publications}}
 <li>
 <p class="publication-title">{{[Study Publication Title]}}</p>

 <p class="publication-authors">{{[Study Publication Author List]}}</p>

 <p class="publication-doi"><a href="http://dx.doi.org/{{[Study Publication DOI]}}" target="_blank">{{[Study Publication DOI]}}</a></p>
 </li>
 {{/each}}
 </ul>
 </div>

 <div class="cf"></div>
 <br/><br/>

 <div id="contacts">

 <span class="section-header">Contacts</span>
 <ul>
 {{#each contacts}}
 <li>
 <p class="publication-title">{{[Study Person First Name]}} {{[Study Person Last Name]}} <span
 class="publication-pubmed-id">{{[Study Person Affiliation]}}</span></p>
 </li>
 {{/each}}
 </ul>
 </div>

 <!--
 <div id="funders">

 <span class="section-header">Funders</span>
 <ul>
 {{#each contacts}}
 <li>
 <p class="publication-title">{{[Study Person First Name]}} {{[Study Person Last Name]}} <span
 class="publication-pubmed-id">{{[Study Person Affiliation]}}</span></p>
 </li>
 {{/each}}
 </ul>

 </div>
 -->



*/

