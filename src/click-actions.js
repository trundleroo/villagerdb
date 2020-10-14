/**
 * Simple script to open a popup when users click on a social media sharing link.
 */

import $ from "jquery";
import _ from 'underscore';

$(document).ready(() => {
    // Copy link buttons
    $('ul.share-buttons a.linking-button').on('click', (e) => {
        e.preventDefault();
        if (e.currentTarget && e.currentTarget.href) {
            // Create a temporary element, select all the content in it, and then execute the copy command
            let tmp = document.createElement('textarea');
            tmp.value = e.currentTarget.href;
            document.body.appendChild(tmp);
            tmp.select();
            document.execCommand('copy');
            document.body.removeChild(tmp);

            // Show success message.
            $(e.currentTarget).tooltip({
                'title': 'Link copied!'
            });
            $(e.currentTarget).tooltip('show');
        }
    });

    // Delete object buttons - and try to prevent double clicks.
    $('a.delete-object-button').on('click', _.debounce(deleteHandler, 100, true));

    // Update list item text
    $('button.add-list-text-button').on('click', showHideListTextBoxes);
    $('form.list-item-updater').on('submit', listeItemUpdateHandler);
    $('input.list-item-updater-text').on('input', _.debounce(submitListItemForm, 1000));
});

/**
 * Handle delete entity clicks
 *
 * @param e
 */
function deleteHandler(e) {
    e.preventDefault();
    if (!e.currentTarget) {
        return;
    }

    let confirmed = true;
    const url = $(e.currentTarget).data('posturl');
    const shouldConfirm = $(e.currentTarget).data('shouldconfirm');

    if (shouldConfirm) {
        confirmed = confirm('You are about to delete this list. This cannot be undone!');
    }

    if (confirmed) {
        $.ajax({
            url: url,
            type: 'POST',
            success: () => {
                // Delete was done, so remove it from the DOM.
                const toDelete = $(e.currentTarget).closest('.deletable-item');
                toDelete.fadeOut(300, () => {
                    toDelete.remove();
                });
            },
            error: () => {
                // This should not occur to a normal user.
                alert('There was a problem deleting this. Please let us know this is happening.');
            }
        });
    }
}

function showHideListTextBoxes(e) {
    if (!e.currentTarget) {
        return;
    }

    const showing = $(e.currentTarget).data('showing');
    if (!showing) {
        $('form.list-item-updater').show();
        $(e.currentTarget).data('showing', true);
        $(e.currentTarget).html('<span class="fa fa-minus"></span> Hide Text');
    } else {
        $('form.list-item-updater').hide();
        $(e.currentTarget).data('showing', false);
        $(e.currentTarget).html('<span class="fa fa-plus"></span> Add Text');
    }
}
/**
 * Handle update to list item text
 *
 * @param e
 */
function listeItemUpdateHandler(e) {
    e.preventDefault();
    if (!e.currentTarget) {
        return;
    }

    const url = $(e.currentTarget).data('update-url');
    const text = $(e.currentTarget).find('input.list-item-updater-text').val();
    const statusDiv = $(e.currentTarget).find('div.list-item-updater-status');

    updateListItemText(url, text, statusDiv);
}

/**
 * Trigger submit of the list item form
 *
 * @param e
 */
function submitListItemForm(e) {
    if (!e.currentTarget) {
        return;
    }

    $(e.currentTarget).closest('form.list-item-updater').submit();
}

/**
 * Update list item text
 *
 * @param url
 * @param text
 * @param statusDiv
 */
function updateListItemText(url, text, statusDiv) {
    // Start the loader
    statusDiv.show();
    statusDiv.html('<span class="fa fa-spin fa-spinner"></span> Loading');

    $.ajax({
        url: url,
        type: 'POST',
        dataType: 'json',
        data: {
            text: text
        },
        success: () => {
            // Display success to user
            statusDiv.html('<span style="color: green;"><span class="fa fa-check"></span> Saved!</span>')
        },
        error: () => {
            // Display error to user
            statusDiv.html('<span style="color: red;"><span class="fa fa-times"></span> Something went wrong. Please try again.</span>');
        }
    });
}