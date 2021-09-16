

/** Catches the submit event and turns the form data into JSON */
$(document).ready(() =>
{
    const modalMessage = $("#modalMessage").html();
    console.log(`MODAL MESSAGE: ${modalMessage}`);

    if (modalMessage !== "")
        $('#messageModal').modal('show');

    $("#addAssetForm").submit(function(event)
    {
        event.preventDefault();
        var formData = $(this).serialize();
        const siteId = $("#assetSiteInput").find(":selected").data("site_id");
        formData += `&site_id=${siteId}`

        console.log(formData);

        $.post({
            url: "/add_asset",
            data: formData
        })
        .done((response) =>
        {
            console.log(response);
            _addAsset(response.data);

            if (response.success === true)
                alert("Success!");

            else alert(`Error occurred: ${response.err}`);
        })
        .fail((response) =>
        {
            alert(`An error occurred: ${response.err}`);
            console.log(response);
        });
    });

    $("#addCategoryForm").submit(function(event)
    {
        event.preventDefault();
        const formData = $(this).serialize();
    
        $.post({
            url: "/add_category",
            data: formData
        })
        .done((response) =>
        {
            console.log(response);
            _addCategory(response.data);

            if (response.success === true)
                alert("Success!");

            else alert(`Error occurred: ${response.err}`);
        })
        .fail((response) =>
        {
            alert(`An error occurred: ${response.err}`);
            console.log(response);
        });
    }); 

    $("#addSiteForm").submit(function(event)
    {
        event.preventDefault();
        const formData = $(this).serialize();
    
        $.post({
            url: "/add_site",
            data: formData
        })
        .done((response) =>
        {
            console.log(response);
            _addSite(response.data);

            if (response.success === true)
                alert("Success!");

            else alert(`Error occurred: ${response.err}`);
        })
        .fail((response) =>
        {
            alert(`An error occurred: ${response.err}`);
            console.log(response);
        });
    }); 

    $("#addLocationForm").submit(function(event)
    {
        event.preventDefault();
        const formData = $(this).serialize();
    
        $.post({
            url: "/add_location",
            data: formData
        })
        .done((response) =>
        {
            console.log(response);
            _addLocation(response.data);

            if (response.success === true)
                alert("Success!");

            else alert(`Error occurred: ${response.err}`);
        })
        .fail((response) =>
        {
            alert(`An error occurred: ${response.err}`);
            console.log(response);
        });
    }); 
});

function _addCategory(categoryData)
{
    console.log(categoryData);
    $("#assetCategoryInput").append($("<option>", {
        value: categoryData.category_id,
        text: categoryData.category_name
    }));
}

function _addSite(siteData)
{
    console.log(siteData);
    $("#assetSiteInput").append($("<option>", {
        value: siteData.location_id,
        text: `${siteData.site_name} - ${siteData.location_name}`,
        "data-site_id": siteData.site_id
    }));

    $("#addLocationSiteInput").append($("<option>", {
        value: siteData.site_id,
        text: siteData.site_name
    }));
}

function _addLocation(locationData)
{
    console.log(locationData);
    $("#assetSiteInput").append($("<option>", {
        value: locationData.location_id,
        text: `${locationData.site_name} - ${locationData.location_name}`
    }));
}

function _addAsset(assetData)
{
    if (Array.isArray(assetData) === true)
        assetData = assetData[assetData.length - 1];

    console.log(assetData);
    $("#assetTable").DataTable().row.add([
        assetData.asset_id,
        assetData.asset_name,
        assetData.category_name,
        assetData.brand,
        assetData.model,
        assetData.site_name,
        assetData.location_name
    ]).draw(false);
}