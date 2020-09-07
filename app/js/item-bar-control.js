$('#cpu-control').click(() => {
    $('#setting-tab').hide();
    $('#system-tab').hide();
    $('#cpu-tab').show();
})
$('#system-control').click(() => {
    $('#setting-tab').hide();
    $('#cpu-tab').hide();
    $('#system-tab').show();
})
$('#setting-control').click(() => {
    $('#system-tab').hide();
    $('#cpu-tab').hide();
    $('#setting-tab').show();
})