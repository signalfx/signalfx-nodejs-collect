{
  "targets": [{
    "target_name": "gcstats",
    "sources": [ "cpp/gcstats.cc" ],
    "include_dirs": [
      "src",
      "<!(node -e \"require('nan')\")"
    ]
  }, {
    "target_name": "action_after_build",
    "type": "none",
    "dependencies": [ "gcstats" ],
    "copies": [{
      "files": [ "<(PRODUCT_DIR)/gcstats.node" ],
      "destination": "<(module_path)"
    }]
  }]
}
