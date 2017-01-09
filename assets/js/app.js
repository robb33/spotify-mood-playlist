
"use strict";

var maxPlaylists = 1000;
var maxPlaylistsToDisplay = 1000;
var credentials = null;
var totalTracks = 0;
var totalPlaylistCount = 0;
var abortFetching = false;
var popNormalize = false;
var allPlaylists = [];
var topTracks = null;
var allTracks = {};


function error(s) {
    info(s);
}

function info(s) {
    $("#info").text(s);
}

function callSpotify(url, data) {
    return $.ajax(url, {
        dataType: 'json',
        data: data,
        headers: {
            'Authorization': 'Bearer ' + credentials.token
        }
    });
}


function initApp() {
    // $(".intro-form").hide();
    // $(".results").hide();
    // $("#playlist-terms").keyup(
    //     function(event) {
    //         if (event.keyCode == 13) {
    //             go();
    //         }
    //     }
    // );


    $("#go").on('click', function() {
        go();
    });
    // $(".stop-button").on('click', function() {
    //     abortFetching = true;
    // });
    // $("#fetch-tracks").on('click', function() {
    //     fetchAllTracksFromPlaylist();
    // });
    $("#login-button").on('click', function() {
        loginWithSpotify();
    });
    // $("#save-button").on('click', function() {
    //     savePlaylist();
    // });
    // $("#norm-for-pop").on('click', function() {
    //     popNormalize = $("#norm-for-pop").is(':checked');
    //     refreshTrackList(allTracks);
    // });
}


    function loginWithSpotify() {
    var client_id = '0b30ba6a3ced43f5bc06c0902f79e47c';
    var redirect_uri = 'https://spotify-mood-playlist.herokuapp.com/';
    // var scopes = 'playlist-modify-public';
    if (document.location.hostname == 'localhost') {
        redirect_uri = 'http://localhost:8000/index.html';
    }
    var url = 'https://accounts.spotify.com/authorize?client_id=' + client_id +
        '&response_type=token' +
        // '&scope=' + encodeURIComponent(scopes) +
        '&redirect_uri=' + encodeURIComponent(redirect_uri);
    document.location = url;
}


function getTime() {
    return Math.round(new Date().getTime() / 1000);
}



function performAuthDance() {
    // if we already have a token and it hasn't expired, use it,
    if ('credentials' in localStorage) {
        credentials = JSON.parse(localStorage.credentials);
    }

    if (credentials && credentials.expires > getTime()) {
        $("#search-form").show();
    } else {
    // we have a token as a hash parameter in the url
    // so parse hash
        var hash = location.hash.replace(/#/g, '');
        var all = hash.split('&');
        var args = {};
        all.forEach(function(keyvalue) {
            var idx = keyvalue.indexOf('=');
            var key = keyvalue.substring(0, idx);
            var val = keyvalue.substring(idx + 1);
            args[key] = val;
        });
        if (typeof(args['access_token']) != 'undefined') {
            var g_access_token = args['access_token'];
            var expiresAt = getTime() + 3600;
            if (typeof(args['expires_in']) != 'undefined') {
                var expires = parseInt(args['expires_in']);
                expiresAt = expires + getTime();
            }
            credentials = {
                token:g_access_token,
                expires:expiresAt
            }
            callSpotify('https://api.spotify.com/v1/me').then(
                function(user) {
                    credentials.user_id = user.id;
                    localStorage['credentials'] = JSON.stringify(credentials);
                    location.hash = '';
                    $("#search-form").show();
                },
                function() {
                    error("Can't get user info");
                }
            );
        } else {
    // otherwise, got to spotify to get auth
            $("#login-form").show();
        }
    }
}


function go() {
    $("#top").hide(200);
    var text = $("#playlist-terms").val()
    if (text.length > 0) {
        info("");
        $(".keywords").text(text);
        $(".results").hide();
        $("#playlist-table").show();
        findMatchingPlaylists(text);
    } else {
        info("Enter some keywords first");
    }
}



$(document).ready(
    function() {
        initApp();
        performAuthDance();
    }
);

