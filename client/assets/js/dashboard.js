

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
        const formData = $(this).serialize();

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
        text: `${siteData.site_name} - ${siteData.location_name}`
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
    console.log(assetData);
    $("#tableBody").append(
        `<td>${assetData.asset_id}</td>
         <td>${assetData.asset_name}</td>
         <td>${assetData.category_name}</td>
         <td>${assetData.brand}</td>
         <td>${assetData.model}</td>
         <td>${assetData.site_name}</td>
         <td>${assetData.location_name}</td>`
    );
}