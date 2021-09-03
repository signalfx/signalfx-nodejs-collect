{
  "targets": [{
    "target_name": "signalfx-collect-gcstats",
    "sources": [ "cpp/gcstats.cc" ],
    "include_dirs": [
      "src",
      "<!(node -e \"require('nan')\")"
    ]
  }, {
    "target_name": "action_after_build",
    "type": "none",
    "dependencies": [ "signalfx-collect-gcstats" ],
    "copies": [{
      "files": [ "<(PRODUCT_DIR)/signalfx-collect-gcstats.node" ],
      "destination": "<(module_path)"
    }]
  }]
}
