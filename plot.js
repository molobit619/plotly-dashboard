d3.json('data/samples.json').then(setup);

let sampleData = {};

function setup(data) {
    sampleData = data;

    const ids = data.metadata.map(entry => entry.id);
    const subjectSelectEl = d3.select('#subjects-select');

    subjectSelectEl.selectAll('option')
        .data(ids)
        .join('option')
        .text(id => id)
        .attr('value', id => id)
    ;

    subjectSelectEl.on('change', () => {
        const activeId = parseInt(d3.event.target.value);
        plotData(activeId);
    });

    plotData(940);
}

function plotData(activeId) {
    const {metadata, samples} = getSubjectData(activeId)

    setMetadata(metadata);
    configureGauge(metadata);
    plotBubblePlot(samples);
    plotHBarPlot(samples);
}

function getSubjectData(id) {
    const metadata = sampleData.metadata.filter(entry => entry.id == id).pop();
    const samples = sampleData.samples.filter(entry => entry.id == id).pop();
    return {metadata, samples};
}

function plotBubblePlot(samples) {
    const trace = {
      x: samples.otu_ids,
      y: samples.sample_values,
      text: samples.otu_labels.map(e => e.split(';').pop()),
      mode: 'markers',
      marker: {
        size: samples.sample_values,
        color: samples.otu_ids
      }
    };

    const data = [trace];

    const layout = {
      title: 'Bacteria Cultures Per Sample',
      showlegend: false,
      height: 600,
    };

    Plotly.newPlot('bubble', data, layout);
}

function plotHBarPlot(samples) {

    let otuIdSamples = samples.otu_ids.map((e, i) => {
        return {id: e, samples: samples.sample_values[i]};
    });

    const top10 = otuIdSamples.sort((e1, e2) => e2.samples - e1.samples).slice(0, 10).reverse();
    const data = [{
      type: 'bar',
      x: top10.map(e => e.samples),
      y: top10.map(e => `OTU ${e.id}`),
      orientation: 'h'
    }];

    const layout = {
      title: 'Top 10 Bacteria Cultures Found',
      height: 600,
    };

    Plotly.newPlot('bar', data, layout);
}

function setMetadata(metadata) {
    d3.select('#subject-id').text(metadata.age);
    d3.select('#subject-bbtype').text(metadata.bbtype);
    d3.select('#subject-ethnicity').text(metadata.ethnicity);
    d3.select('#subject-gender').text(metadata.gender);
    d3.select('#subject-id').text(metadata.id);
    d3.select('#subject-age').text(metadata.age);
    d3.select('#subject-location').text(metadata.location);
    d3.select('#subject-wfreq').text(metadata.wfreq);
}

function configureGauge(metadata) {
    const data = [
        {
            domain: { x: [0, 1], y: [0, 1] },
            value: metadata.wfreq,
            title: { text: "Scrubs Per Week" },
            type: "indicator",
            mode: "gauge+number",
            gauge: {
                axis: { range: [0, 10] },
            }
        }
    ];

    const layout = { width: 600, height: 500, margin: { t: 0, b: 0 } };
    Plotly.newPlot('gauge', data, layout);
}
